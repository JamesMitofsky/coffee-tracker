"use client";

import { useState } from "react";
import { Settings, BREWERS } from "@/types";
import { SearchableSelect } from "@/components/SearchableSelect";

export function SettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const brewerOptions = BREWERS.map((b) => ({ value: b, label: b }));

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

      <div>
        <SearchableSelect
          label="Default brewer"
          options={brewerOptions}
          value={form.defaultBrewer ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, defaultBrewer: v }))}
          allowCustom
        />
        <p className="text-xs text-stone-400 mt-1">Pre-fills brewer on new brews.</p>
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
