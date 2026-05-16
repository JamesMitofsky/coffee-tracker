"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { z } from "zod";
import { Brew, Bean, Settings, BrewSchema, BeanSchema, SettingsSchema } from "@/types";

const DataFileSchema = z.object({
  brews: z.array(BrewSchema).default([]),
  beans: z.array(BeanSchema).default([]),
  settings: SettingsSchema.default({}),
  grinders: z.array(z.string()).default([]),
  brewers: z.array(z.string()).default([]),
});

export type DataStore = z.infer<typeof DataFileSchema>;

interface DataContextValue {
  data: DataStore | null;
  hasData: boolean;
  loadFromFile: (file: File) => Promise<void>;
  startFresh: () => void;
  addBrew: (brew: Brew) => void;
  updateBrew: (id: string, updates: Partial<Brew>) => void;
  deleteBrew: (id: string) => void;
  addBean: (bean: Bean) => void;
  updateBean: (id: string, updates: Partial<Bean>) => void;
  deleteBean: (id: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  addGrinder: (name: string) => void;
  addBrewer: (name: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);
const STORAGE_KEY = "coffee-tracker-data";

const EMPTY_STORE: DataStore = {
  brews: [],
  beans: [],
  settings: {},
  grinders: [],
  brewers: [],
};

function loadFromStorage(): DataStore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return DataFileSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataStore | null>(() => {
    if (typeof window === "undefined") return null;
    return loadFromStorage();
  });

  useEffect(() => {
    if (data === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const loadFromFile = useCallback(async (file: File) => {
    const text = await file.text();
    const parsed = DataFileSchema.parse(JSON.parse(text));
    setData(parsed);
  }, []);

  const startFresh = useCallback(() => setData(EMPTY_STORE), []);

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

  const addGrinder = useCallback((name: string) => {
    setData((d) => {
      if (!d || d.grinders.includes(name)) return d;
      return { ...d, grinders: [...d.grinders, name] };
    });
  }, []);

  const addBrewer = useCallback((name: string) => {
    setData((d) => {
      if (!d || d.brewers.includes(name)) return d;
      return { ...d, brewers: [...d.brewers, name] };
    });
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        hasData: data !== null,
        loadFromFile,
        startFresh,
        addBrew,
        updateBrew,
        deleteBrew,
        addBean,
        updateBean,
        deleteBean,
        updateSettings,
        addGrinder,
        addBrewer,
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
