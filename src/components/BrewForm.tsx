"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrewInput, Bean, TasteTag, BrewSchema } from "@/types";
import { SearchableSelect } from "./SearchableSelect";
import { QualityPicker } from "./QualityPicker";
import { TasteTagPicker } from "./TasteTagPicker";
import { BrewTimer } from "./BrewTimer";
import { Thermometer, Timer, Drop, ArrowsHorizontal, Barbell } from "@phosphor-icons/react";
import { useData } from "@/lib/data-context";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

interface Props {
  beans: Bean[];
  grinders: string[];
  brewers: string[];
  initial?: Partial<BrewInput>;
  brewId?: string;
  defaultBrewer?: string;
  defaultGrinder?: string;
  preferredGrindSize?: number;
}

export function BrewForm({ beans, grinders, brewers, initial, brewId, defaultBrewer, defaultGrinder, preferredGrindSize }: Props) {
  const router = useRouter();
  const { addBrew, updateBrew } = useData();
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const initialForm: Partial<BrewInput> = {
    date: today,
    brewer: defaultBrewer ?? "French Press",
    grinder: defaultGrinder,
    waterG: undefined,
    brewRatio: 15,
    grindSize: preferredGrindSize,
    brewTimeMins: undefined,
    waterTempC: undefined,
    quality: undefined,
    tasteTags: [],
    notes: "",
    vibes: "",
    ...initial,
  };
  const initialSnapshot = useRef(JSON.stringify(initialForm));
  const [form, setForm] = useState<Partial<BrewInput>>(initialForm);
  const isDirty = JSON.stringify(form) !== initialSnapshot.current;
  const { confirmLeave } = useUnsavedChanges(isDirty);

  const [error, setError] = useState<string | null>(null);

  const beansG =
    form.waterG && form.brewRatio ? Math.round(form.waterG / form.brewRatio) : null;

  function set<K extends keyof BrewInput>(key: K, val: BrewInput[K] | undefined) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function numInput(key: keyof BrewInput, val: string) {
    const n = val === "" ? undefined : parseFloat(val);
    set(key, n as never);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (brewId) {
      const result = BrewSchema.partial().safeParse(form);
      if (!result.success) {
        setError(JSON.stringify(result.error.flatten(), null, 2));
        return;
      }
      updateBrew(brewId, form);
    } else {
      const result = BrewSchema.safeParse({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...form,
      });
      if (!result.success) {
        setError(JSON.stringify(result.error.flatten(), null, 2));
        return;
      }
      addBrew(result.data);
    }

    router.push("/");
  }

  const beanOptions = beans.map((b) => ({ value: b.id, label: b.name }));
  const brewerOptions = brewers.map((b) => ({ value: b, label: b }));
  const grinderOptions = grinders.map((g) => ({ value: g, label: g }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <SearchableSelect
        label="Grinder"
        options={grinderOptions}
        value={form.grinder ?? ""}
        onChange={(v) => set("grinder", v)}
        allowCustom
        placeholder="Select grinder…"
      />

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
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 mb-1.5"
          />
          <BrewTimer
            valueMins={form.brewTimeMins}
            onChange={(mins) => set("brewTimeMins", mins)}
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

      <QualityPicker
        label="Quality"
        value={form.quality}
        onChange={(v) => set("quality", v)}
      />

      <TasteTagPicker
        label="Taste"
        value={(form.tasteTags as TasteTag[]) ?? []}
        onChange={(tags) => set("tasteTags", tags)}
      />

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Brewing details
        </label>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="Bloom 45s, scooped crust at 2min…"
          className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Vibes &amp; feedback
        </label>
        <textarea
          value={form.vibes ?? ""}
          onChange={(e) => set("vibes", e.target.value)}
          rows={2}
          placeholder="Tasted a bit hollow mid-palate, bright finish…"
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
          className="flex-1 py-2 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          {brewId ? "Update brew" : "Log brew"}
        </button>
        <button
          type="button"
          onClick={() => confirmLeave() && router.back()}
          className="px-4 py-2 border border-stone-200 text-stone-600 rounded-md text-sm hover:bg-stone-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
