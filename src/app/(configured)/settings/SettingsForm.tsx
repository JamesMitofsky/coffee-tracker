"use client";

import { useRef, useState } from "react";
import { Settings } from "@/types";
import { useData } from "@/lib/data-context";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

export function SettingsForm() {
  const { data, updateSettings } = useData();
  const initialSettings = data?.settings ?? {};
  const initialSnapshot = useRef(JSON.stringify(initialSettings));
  const [form, setForm] = useState<Settings>(initialSettings);
  const isDirty = JSON.stringify(form) !== initialSnapshot.current;
  useUnsavedChanges(isDirty);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateSettings(form);
    initialSnapshot.current = JSON.stringify(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Preferred grind size
        </label>
        <p className="text-xs text-stone-400 mb-2">
          Pre-fills the grind size field on new brews. Per-bean anchor — not per-brew signal.
        </p>
        <input
          type="number"
          value={form.preferredGrindSize ?? ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              preferredGrindSize: e.target.value ? parseFloat(e.target.value) : undefined,
            }))
          }
          step="0.5"
          placeholder="19"
          className="w-32 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>

      <button
        type="submit"
        className="px-5 py-2 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-700 transition-colors"
      >
        {saved ? "Saved" : "Save settings"}
      </button>
    </form>
  );
}
