"use client";

import { useState } from "react";
import { PlugsConnected } from "@phosphor-icons/react";
import { useData } from "@/lib/data-context";
import { GrindSizeMatrix } from "./GrindSizeMatrix";
import { GrindersManager } from "./GrindersManager";
import { BrewersManager } from "./BrewersManager";
import { DataManager } from "./DataManager";

export default function SettingsPage() {
  const { data, disconnect } = useData();
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  if (!data) return null;

  async function handleDisconnect() {
    if (!confirmDisconnect) {
      setConfirmDisconnect(true);
      return;
    }
    await disconnect();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h2 className="text-sm font-semibold text-stone-700 mb-1">Preferred grind sizes</h2>
        <p className="text-xs text-stone-400 mb-4">
          Per grinder + brewer combination. Pre-fills grind size on new brews.
        </p>
        <GrindSizeMatrix />
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

      <div className="pt-4 border-t border-stone-100">
        <button
          type="button"
          onClick={handleDisconnect}
          onBlur={() => setConfirmDisconnect(false)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm border rounded-md transition-colors ${
            confirmDisconnect
              ? "border-red-400 bg-red-50 text-red-700 hover:bg-red-100"
              : "border-stone-300 text-stone-500 hover:bg-stone-50"
          }`}
        >
          <PlugsConnected size={15} />
          {confirmDisconnect ? "Confirm disconnect" : "Disconnect file"}
        </button>
        {confirmDisconnect && (
          <p className="mt-2 text-xs text-stone-400">
            Your data file stays on disk — only this app&apos;s connection is removed.
          </p>
        )}
      </div>
    </div>
  );
}
