"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { z, ZodError } from "zod";
import { Brew, Bean, Settings, BrewSchema, BeanSchema, SettingsSchema, GrinderSchema, BrewerSchema, Grinder, Brewer, BrewMethod, GrindSize } from "@/types";

const DataFileSchema = z.object({
  brews: z.array(BrewSchema).default([]),
  beans: z.array(BeanSchema).default([]),
  settings: SettingsSchema.default({ grindSizeMatrix: [] }),
  grinders: z.array(GrinderSchema).default([]),
  brewers: z.array(BrewerSchema).default([]),
});

export type DataStore = z.infer<typeof DataFileSchema>;

interface DataContextValue {
  data: DataStore | null;
  hasData: boolean;
  fileName: string | null;
  openFile: () => Promise<void>;
  createFile: () => Promise<void>;
  disconnect: () => Promise<void>;
  addBrew: (brew: Brew) => void;
  updateBrew: (id: string, updates: Partial<Brew>) => void;
  deleteBrew: (id: string) => void;
  addBean: (bean: Bean) => void;
  updateBean: (id: string, updates: Partial<Bean>) => void;
  deleteBean: (id: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  addGrinder: (name: string, shortName?: string) => void;
  updateGrinder: (id: string, updates: Partial<Grinder>) => void;
  setDefaultGrinder: (id: string | undefined) => void;
  addBrewer: (name: string, method?: BrewMethod) => void;
  updateBrewer: (id: string, updates: Partial<Brewer>) => void;
  setGrindSizeEntry: (grinderId: string, brewerId: string, grindSize: GrindSize | undefined) => void;
}

const DataContext = createContext<DataContextValue | null>(null);
const STORAGE_KEY = "coffee-tracker-data";
const IDB_NAME = "coffee-tracker-fs";
const IDB_STORE = "handles";
const IDB_HANDLE_KEY = "data-file";

const EMPTY_STORE: DataStore = {
  brews: [],
  beans: [],
  settings: { grindSizeMatrix: [] },
  grinders: [],
  brewers: [],
};

const REMOVED_TASTE_TAGS = new Set(["bitter", "sweet"]);

function migrateGrindSizeValue(v: unknown): { primary: number; secondary: number } {
  if (typeof v === "number") return { primary: Math.round(v), secondary: 0 };
  return v as { primary: number; secondary: number };
}

function migrateBrewToNested(brew: Record<string, unknown>): Record<string, unknown> {
  if (brew.brewingInfo) {
    const info = brew.brewingInfo as Record<string, unknown>;
    if (typeof info.grindSize === "number") {
      return { ...brew, brewingInfo: { ...info, grindSize: migrateGrindSizeValue(info.grindSize) } };
    }
    return brew;
  }
  const rawTags = Array.isArray(brew.tasteTags) ? (brew.tasteTags as string[]) : [];
  return {
    id: brew.id,
    createdAt: brew.createdAt,
    brewingInfo: {
      date: brew.date,
      beanId: brew.beanId,
      brewerId: brew.brewer,
      grinderId: brew.grinder,
      waterG: brew.waterG,
      brewRatio: brew.brewRatio,
      grindSize: migrateGrindSizeValue(brew.grindSize),
      brewTimeMins: brew.brewTimeMins,
      waterTempC: brew.waterTempC,
      notes: brew.notes,
    },
    postBrewEvaluation: {
      quality: brew.quality,
      tasteTags: rawTags.filter((t) => !REMOVED_TASTE_TAGS.has(t)),
      vibes: brew.vibes,
      sweetnessLevel: undefined,
    },
  };
}

function migrateData(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) return raw;
  const data = { ...(raw as Record<string, unknown>) };

  const grinderIdByName = new Map<string, string>();
  const brewerIdByName = new Map<string, string>();

  if (Array.isArray(data.grinders) && data.grinders.length > 0 && typeof data.grinders[0] === "string") {
    data.grinders = (data.grinders as string[]).map((name) => {
      const id = crypto.randomUUID();
      grinderIdByName.set(name, id);
      return { id, name };
    });
  }

  if (Array.isArray(data.brewers) && data.brewers.length > 0 && typeof data.brewers[0] === "string") {
    data.brewers = (data.brewers as string[]).map((name) => {
      const id = crypto.randomUUID();
      brewerIdByName.set(name, id);
      return { id, name };
    });
  }

  if (Array.isArray(data.brews)) {
    data.brews = (data.brews as Array<Record<string, unknown>>).map((brew) => {
      let updated = { ...brew };
      if (grinderIdByName.size > 0 || brewerIdByName.size > 0) {
        if (typeof brew.grinder === "string" && grinderIdByName.has(brew.grinder)) {
          updated.grinder = grinderIdByName.get(brew.grinder);
        }
        if (typeof brew.brewer === "string" && brewerIdByName.has(brew.brewer)) {
          updated.brewer = brewerIdByName.get(brew.brewer);
        }
      }
      updated = migrateBrewToNested(updated);
      return updated;
    });
  }

  if (typeof data.settings === "object" && data.settings !== null) {
    const settings = { ...(data.settings as Record<string, unknown>) };
    if (typeof settings.defaultGrinder === "string" && grinderIdByName.has(settings.defaultGrinder)) {
      settings.defaultGrinder = grinderIdByName.get(settings.defaultGrinder);
    }
    if (typeof settings.defaultBrewer === "string" && brewerIdByName.has(settings.defaultBrewer)) {
      settings.defaultBrewer = brewerIdByName.get(settings.defaultBrewer);
    }
    if (Array.isArray(settings.grindSizeMatrix)) {
      settings.grindSizeMatrix = (settings.grindSizeMatrix as Array<Record<string, unknown>>).map((entry) => ({
        ...entry,
        grindSize: migrateGrindSizeValue(entry.grindSize),
      }));
    }
    data.settings = settings;
  }

  return data;
}

function formatZodImportError(err: ZodError): string {
  const issues = err.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `  • ${path}: ${issue.message}`;
  });
  return `Invalid data file. ${issues.length} validation error${issues.length === 1 ? "" : "s"}:\n${issues.join("\n")}`;
}

function loadFromStorage(): DataStore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return DataFileSchema.parse(migrateData(JSON.parse(raw)));
  } catch {
    return null;
  }
}

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveHandleToIDB(handle: FileSystemFileHandle): Promise<void> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(handle, IDB_HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadHandleFromIDB(): Promise<FileSystemFileHandle | null> {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(IDB_HANDLE_KEY);
      req.onsuccess = () => resolve((req.result as FileSystemFileHandle) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function clearHandleFromIDB(): Promise<void> {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(IDB_HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

async function writeDataToFile(handle: FileSystemFileHandle, data: DataStore): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataStore | null>(() => {
    if (typeof window === "undefined") return null;
    return loadFromStorage();
  });
  const [fileName, setFileName] = useState<string | null>(null);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);

  // Persist to localStorage and write to file on every data change
  useEffect(() => {
    if (data === null) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (fileHandleRef.current) {
      writeDataToFile(fileHandleRef.current, data).catch(console.error);
    }
  }, [data]);

  // On mount: try to restore file handle from IDB and reload fresh data from file
  useEffect(() => {
    async function tryRestoreFile() {
      const handle = await loadHandleFromIDB();
      if (!handle) return;

      let permission = await handle.queryPermission({ mode: "readwrite" });
      if (permission === "prompt") {
        permission = await handle.requestPermission({ mode: "readwrite" });
      }
      if (permission !== "granted") {
        await clearHandleFromIDB();
        return;
      }

      try {
        const file = await handle.getFile();
        const text = await file.text();
        const parsed = DataFileSchema.parse(migrateData(JSON.parse(text)));
        fileHandleRef.current = handle;
        setFileName(handle.name);
        setData(parsed);
      } catch {
        await clearHandleFromIDB();
      }
    }

    tryRestoreFile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openFile = useCallback(async () => {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
      excludeAcceptAllOption: true,
    });
    const file = await handle.getFile();
    const text = await file.text();
    let parsed: DataStore;
    try {
      parsed = DataFileSchema.parse(migrateData(JSON.parse(text)));
    } catch (err) {
      if (err instanceof ZodError) throw new Error(formatZodImportError(err));
      throw err;
    }
    await saveHandleToIDB(handle);
    fileHandleRef.current = handle;
    setFileName(handle.name);
    setData(parsed);
  }, []);

  const disconnect = useCallback(async () => {
    await clearHandleFromIDB();
    fileHandleRef.current = null;
    setFileName(null);
    setData(null);
  }, []);

  const createFile = useCallback(async () => {
    const handle = await window.showSaveFilePicker({
      suggestedName: "coffee-tracker.json",
      types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
    });
    await saveHandleToIDB(handle);
    fileHandleRef.current = handle;
    setFileName(handle.name);
    setData(EMPTY_STORE);
  }, []);

  const addBrew = useCallback((brew: Brew) => {
    setData((d) => (d ? { ...d, brews: [...d.brews, brew] } : d));
  }, []);

  const updateBrew = useCallback((id: string, updates: Partial<Brew>) => {
    setData((d) =>
      d ? { ...d, brews: d.brews.map((b) => (b.id === id ? { ...b, ...updates } : b)) } : d
    );
  }, []);

  const deleteBrew = useCallback((id: string) => {
    setData((d) => (d ? { ...d, brews: d.brews.filter((b) => b.id !== id) } : d));
  }, []);

  const addBean = useCallback((bean: Bean) => {
    setData((d) => (d ? { ...d, beans: [...d.beans, bean] } : d));
  }, []);

  const updateBean = useCallback((id: string, updates: Partial<Bean>) => {
    setData((d) =>
      d ? { ...d, beans: d.beans.map((b) => (b.id === id ? { ...b, ...updates } : b)) } : d
    );
  }, []);

  const deleteBean = useCallback((id: string) => {
    setData((d) => (d ? { ...d, beans: d.beans.filter((b) => b.id !== id) } : d));
  }, []);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setData((d) => (d ? { ...d, settings: { ...d.settings, ...updates } } : d));
  }, []);

  const updateGrinder = useCallback((id: string, updates: Partial<Grinder>) => {
    setData((d) =>
      d ? { ...d, grinders: d.grinders.map((g) => (g.id === id ? { ...g, ...updates } : g)) } : d
    );
  }, []);

  const setDefaultGrinder = useCallback((id: string | undefined) => {
    setData((d) => {
      if (!d) return d;
      const grinders = d.grinders.map((g) => ({ ...g, isDefault: g.id === id ? true : undefined }));
      return { ...d, grinders, settings: { ...d.settings, defaultGrinder: id } };
    });
  }, []);

  const addGrinder = useCallback((name: string, shortName?: string) => {
    setData((d) => {
      if (!d || d.grinders.some((g) => g.name === name)) return d;
      const grinder = shortName ? { id: crypto.randomUUID(), name, shortName } : { id: crypto.randomUUID(), name };
      return { ...d, grinders: [...d.grinders, grinder] };
    });
  }, []);

  const updateBrewer = useCallback((id: string, updates: Partial<Brewer>) => {
    setData((d) =>
      d ? { ...d, brewers: d.brewers.map((b) => (b.id === id ? { ...b, ...updates } : b)) } : d
    );
  }, []);

  const addBrewer = useCallback((name: string, method?: BrewMethod) => {
    setData((d) => {
      if (!d || d.brewers.some((b) => b.name === name)) return d;
      const brewer: Brewer = { id: crypto.randomUUID(), name, ...(method ? { method } : {}) };
      return { ...d, brewers: [...d.brewers, brewer] };
    });
  }, []);

  const setGrindSizeEntry = useCallback((grinderId: string, brewerId: string, grindSize: GrindSize | undefined) => {
    setData((d) => {
      if (!d) return d;
      const filtered = d.settings.grindSizeMatrix.filter(
        (e) => !(e.grinderId === grinderId && e.brewerId === brewerId)
      );
      const matrix = grindSize !== undefined
        ? [...filtered, { grinderId, brewerId, grindSize }]
        : filtered;
      return { ...d, settings: { ...d.settings, grindSizeMatrix: matrix } };
    });
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        hasData: data !== null,
        fileName,
        openFile,
        createFile,
        disconnect,
        addBrew,
        updateBrew,
        deleteBrew,
        addBean,
        updateBean,
        deleteBean,
        updateSettings,
        addGrinder,
        updateGrinder,
        setDefaultGrinder,
        addBrewer,
        updateBrewer,
        setGrindSizeEntry,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
