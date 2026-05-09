import fs from "fs";
import path from "path";
import { Settings } from "@/types";

const CONFIG_PATH = path.join(process.cwd(), "coffee-tracker.config.json");

export interface AppConfig extends Settings {
  dataFile: string | null;
}

function readConfig(): AppConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { dataFile: null };
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8")) as AppConfig;
}

function writeConfig(config: AppConfig): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export const config = {
  get: readConfig,
  update: (updates: Partial<AppConfig>): AppConfig => {
    const current = readConfig();
    const next = { ...current, ...updates };
    writeConfig(next);
    return next;
  },
};
