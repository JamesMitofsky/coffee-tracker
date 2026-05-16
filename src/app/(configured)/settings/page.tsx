"use client";

import { useData } from "@/lib/data-context";
import { SettingsForm } from "./SettingsForm";
import { GrindersManager } from "./GrindersManager";
import { BrewersManager } from "./BrewersManager";
import { DataManager } from "./DataManager";

export default function SettingsPage() {
  const { data } = useData();
  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-stone-900 mb-6">Settings</h1>
        <SettingsForm />
      </div>


      <div>
        <h2 className="text-sm font-semibold text-stone-700 mb-3">Brewers</h2>
        <BrewersManager />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-stone-700 mb-3">Grinders</h2>
        <GrindersManager />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-stone-700 mb-3">Data</h2>
        <DataManager />
      </div>
    </div>
  );
}
