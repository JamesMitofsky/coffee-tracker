"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrewInput, Bean, BREWERS, TasteTag } from "@/types";
import { SearchableSelect } from "./SearchableSelect";
import { QualityPicker } from "./QualityPicker";
import { TasteTagPicker } from "./TasteTagPicker";
import { Thermometer, Timer, Drop, ArrowsHorizontal, Barbell } from "@phosphor-icons/react";

interface Props {
  beans: Bean[];
  initial?: Partial<BrewInput>;
  brewId?: string;
  defaultBrewer?: string;
  preferredGrindSize?: number;
}

export function BrewForm({ beans, initial, brewId, defaultBrewer, preferredGrindSize }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<Partial<BrewInput>>({
    date: today,
    brewer: defaultBrewer ?? "French Press",
    waterG: undefined,
    brewRatio: 15,
    grindSize: preferredGrindSize,
    brewTimeMins: undefined,
    waterTempC: undefined,
    quality: undefined,
    tasteTags: [],
    notes: "",
    ...initial,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const beansG =
    form.waterG && form.brewRatio
      ? Math.round(form.waterG / form.brewRatio)
      : null;

  function set<K extends keyof BrewInput>(key: K, val: BrewInput[K] | undefined) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function numInput(key: keyof BrewInput, val: string) {
    const n = val === "" ? undefined : parseFloat(val);
    set(key, n as never);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = brewId ? `/api/brews/${brewId}` : "/api/brews";
      const method = brewId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(JSON.stringify(data.error, null, 2));
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const beanOptions = beans.map((b) => ({ value: b.id, label: b.name }));
  const brewerOptions = BREWERS.map((b) => ({ value: b, label: b }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Row 1: date + bean */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Date <span className="text-stone-400">*</span>
          </label>
          <input
            type="date"
            value={form.date ?? ""}
            onChange={(e) => set("date", e.target.value)}
            required
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        <SearchableSelect
          label="Brewer"
          required
          options={brewerOptions}
          value={form.brewer ?? ""}
          onChange={(v) => set("brewer", v)}
          allowCustom
        />
      </div>

      {/* Bean */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <SearchableSelect
            label="Bean"
            required
            options={beanOptions}
            value={form.beanId ?? ""}
            onChange={(v) => set("beanId", v)}
            placeholder="Select bean…"
          />
        </div>
        <a
          href="/beans?new=1"
          className="text-xs text-stone-400 hover:text-stone-600 pb-2 whitespace-nowrap"
        >
          + Add bean
        </a>
      </div>

      {/* Water + ratio + derived */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1">
            <Drop size={14} /> Water (g) <span className="text-stone-400">*</span>
          </label>
          <input
            type="number"
            value={form.waterG ?? ""}
            onChange={(e) => numInput("waterG", e.target.value)}
            placeholder="800"
            required
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1">
            <ArrowsHorizontal size={14} /> Ratio <span className="text-stone-400">*</span>
          </label>
          <input
            type="number"
            value={form.brewRatio ?? ""}
            onChange={(e) => numInput("brewRatio", e.target.value)}
            placeholder="15"
            step="0.5"
            required
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Beans (g)
          </label>
          <div className="w-full px-3 py-2 border border-stone-100 rounded-md text-sm text-stone-400 bg-stone-50">
            {beansG !== null ? `${beansG} g` : "—"}
          </div>
        </div>
      </div>

      {/* Grind + brew time + water temp */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1">
            <Barbell size={14} /> Grind size <span className="text-stone-400">*</span>
          </label>
          <input
            type="number"
            value={form.grindSize ?? ""}
            onChange={(e) => numInput("grindSize", e.target.value)}
            placeholder={String(preferredGrindSize ?? 19)}
            step="0.5"
            required
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1">
            <Timer size={14} /> Brew time (min) <span className="text-stone-400">*</span>
          </label>
          <input
            type="number"
            value={form.brewTimeMins ?? ""}
            onChange={(e) => numInput("brewTimeMins", e.target.value)}
            placeholder="3"
            step="0.5"
            required
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1">
            <Thermometer size={14} /> Temp (°C)
          </label>
          <input
            type="number"
            value={form.waterTempC ?? ""}
            onChange={(e) => numInput("waterTempC", e.target.value)}
            placeholder="94"
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
      </div>

      {/* Quality */}
      <QualityPicker
        label="Quality"
        value={form.quality}
        onChange={(v) => set("quality", v)}
      />

      {/* Taste tags */}
      <TasteTagPicker
        label="Taste"
        value={(form.tasteTags as TasteTag[]) ?? []}
        onChange={(tags) => set("tasteTags", tags)}
      />

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Notes
        </label>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="Bloom 45s, scooped crust at 2min…"
          className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
        />
      </div>

      {error && (
        <pre className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3 overflow-auto">
          {error}
        </pre>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : brewId ? "Update brew" : "Log brew"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-stone-200 text-stone-600 rounded-md text-sm hover:bg-stone-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
