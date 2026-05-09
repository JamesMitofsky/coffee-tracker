import fs from "fs";
import path from "path";
import { Brew, Bean, Settings } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

function readJSON<T>(filename: string): T {
  const filepath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filepath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJSON<T>(filename: string, data: T): void {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

export const db = {
  brews: {
    getAll: (): Brew[] => readJSON<Brew[]>("brews.json"),
    getById: (id: string): Brew | undefined =>
      readJSON<Brew[]>("brews.json").find((b) => b.id === id),
    create: (brew: Brew): Brew => {
      const brews = readJSON<Brew[]>("brews.json");
      brews.push(brew);
      writeJSON("brews.json", brews);
      return brew;
    },
    update: (id: string, updates: Partial<Brew>): Brew | null => {
      const brews = readJSON<Brew[]>("brews.json");
      const idx = brews.findIndex((b) => b.id === id);
      if (idx === -1) return null;
      brews[idx] = { ...brews[idx], ...updates };
      writeJSON("brews.json", brews);
      return brews[idx];
    },
    delete: (id: string): boolean => {
      const brews = readJSON<Brew[]>("brews.json");
      const filtered = brews.filter((b) => b.id !== id);
      if (filtered.length === brews.length) return false;
      writeJSON("brews.json", filtered);
      return true;
    },
  },
  beans: {
    getAll: (): Bean[] => readJSON<Bean[]>("beans.json"),
    getById: (id: string): Bean | undefined =>
      readJSON<Bean[]>("beans.json").find((b) => b.id === id),
    create: (bean: Bean): Bean => {
      const beans = readJSON<Bean[]>("beans.json");
      beans.push(bean);
      writeJSON("beans.json", beans);
      return bean;
    },
    update: (id: string, updates: Partial<Bean>): Bean | null => {
      const beans = readJSON<Bean[]>("beans.json");
      const idx = beans.findIndex((b) => b.id === id);
      if (idx === -1) return null;
      beans[idx] = { ...beans[idx], ...updates };
      writeJSON("beans.json", beans);
      return beans[idx];
    },
    delete: (id: string): boolean => {
      const beans = readJSON<Bean[]>("beans.json");
      const filtered = beans.filter((b) => b.id !== id);
      if (filtered.length === beans.length) return false;
      writeJSON("beans.json", filtered);
      return true;
    },
  },
  settings: {
    get: (): Settings => readJSON<Settings>("settings.json"),
    update: (updates: Partial<Settings>): Settings => {
      const current = readJSON<Settings>("settings.json");
      const updated = { ...current, ...updates };
      writeJSON("settings.json", updated);
      return updated;
    },
  },
};
