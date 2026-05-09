import fs from "fs";
import { Brew, Bean } from "@/types";
import { config } from "./config";

interface DataFile {
  brews: Brew[];
  beans: Bean[];
}

function getDataPath(): string {
  const dataFile = config.get().dataFile;
  if (!dataFile) throw new Error("No data file configured");
  return dataFile;
}

function readData(): DataFile {
  const p = getDataPath();
  const raw = fs.readFileSync(p, "utf-8");
  const parsed = JSON.parse(raw) as Partial<DataFile>;
  return {
    brews: parsed.brews ?? [],
    beans: parsed.beans ?? [],
  };
}

function writeData(data: DataFile): void {
  fs.writeFileSync(getDataPath(), JSON.stringify(data, null, 2));
}

export const db = {
  brews: {
    getAll: (): Brew[] => readData().brews,
    getById: (id: string): Brew | undefined =>
      readData().brews.find((b) => b.id === id),
    create: (brew: Brew): Brew => {
      const data = readData();
      data.brews.push(brew);
      writeData(data);
      return brew;
    },
    update: (id: string, updates: Partial<Brew>): Brew | null => {
      const data = readData();
      const idx = data.brews.findIndex((b) => b.id === id);
      if (idx === -1) return null;
      data.brews[idx] = { ...data.brews[idx], ...updates };
      writeData(data);
      return data.brews[idx];
    },
    delete: (id: string): boolean => {
      const data = readData();
      const filtered = data.brews.filter((b) => b.id !== id);
      if (filtered.length === data.brews.length) return false;
      writeData({ ...data, brews: filtered });
      return true;
    },
  },
  beans: {
    getAll: (): Bean[] => readData().beans,
    getById: (id: string): Bean | undefined =>
      readData().beans.find((b) => b.id === id),
    create: (bean: Bean): Bean => {
      const data = readData();
      data.beans.push(bean);
      writeData(data);
      return bean;
    },
    update: (id: string, updates: Partial<Bean>): Bean | null => {
      const data = readData();
      const idx = data.beans.findIndex((b) => b.id === id);
      if (idx === -1) return null;
      data.beans[idx] = { ...data.beans[idx], ...updates };
      writeData(data);
      return data.beans[idx];
    },
    delete: (id: string): boolean => {
      const data = readData();
      const filtered = data.beans.filter((b) => b.id !== id);
      if (filtered.length === data.beans.length) return false;
      writeData({ ...data, beans: filtered });
      return true;
    },
  },
};
