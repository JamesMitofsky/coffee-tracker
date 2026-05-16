"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrewingInfo, PostBrewEvaluation, TasteTag, BrewSchema, BrewInputSchema, Grinder, Brewer, GrindSizeEntry, GrindSize } from "@/types";
import { Bean } from "@/types";
import { SearchableSelect } from "./SearchableSelect";
import { QualityPicker } from "./QualityPicker";
import { TasteTagPicker } from "./TasteTagPicker";
import { SweetnessSlider } from "./SweetnessSlider";
import { BrewTimer } from "./BrewTimer";
import { Thermometer, Timer, Drop, ArrowsHorizontal, Barbell } from "@phosphor-icons/react";
import { GrindSizeInput } from "./GrindSizeInput";
import { useData } from "@/lib/data-context";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

interface Props {
  beans: Bean[];
  grinders: Grinder[];
  brewers: Brewer[];
  grindSizeMatrix: GrindSizeEntry[];
  initial?: {
    brewingInfo?: Partial<BrewingInfo>;
    postBrewEvaluation?: Partial<PostBrewEvaluation>;
  };
  brewId?: string;
  defaultBrewer?: string;
  defaultGrinder?: string;
}

export function BrewForm({ beans, grinders, brewers, grindSizeMatrix, initial, brewId, defaultBrewer, defaultGrinder }: Props) {
  const router = useRouter();
  const { addBrew, updateBrew } = useData();
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  function lookupGrindSize(grinderId: string | undefined, brewerId: string | undefined): GrindSize | undefined {
    if (!grinderId || !brewerId) return undefined;
    return grindSizeMatrix.find((e) => e.grinderId === grinderId && e.brewerId === brewerId)?.grindSize;
  }

  const defaultBrewingInfo: Partial<BrewingInfo> = {
    date: today,
    brewerId: defaultBrewer ?? "",
    grinderId: defaultGrinder,
    waterG: undefined,
    brewRatio: 15,
    grindSize: lookupGrindSize(defaultGrinder, defaultBrewer),
    brewTimeMins: undefined,
    waterTempC: undefined,
    notes: "",
    ...initial?.brewingInfo,
  };

  const defaultPostEval: Partial<PostBrewEvaluation> = {
    quality: undefined,
    tasteTags: [],
    vibes: "",
    sweetnessLevel: undefined,
    ...initial?.postBrewEvaluation,
  };

  const initialSnapshot = useRef(JSON.stringify({ brewingInfo: defaultBrewingInfo, postBrewEvaluation: defaultPostEval }));
  const [brewInfo, setBrewInfo] = useState<Partial<BrewingInfo>>(defaultBrewingInfo);
  const [postEval, setPostEval] = useState<Partial<PostBrewEvaluation>>(defaultPostEval);
  const isDirty = JSON.stringify({ brewingInfo: brewInfo, postBrewEvaluation: postEval }) !== initialSnapshot.current;
  const { confirmLeave } = useUnsavedChanges(brewId ? false : isDirty);

  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const autosaveSkip = useRef(true);
  useEffect(() => {
    if (!brewId) return;
    if (autosaveSkip.current) {
      autosaveSkip.current = false;
      return;
    }
    setSaveStatus("saving");
    const timer = setTimeout(() => {
      const payload = { brewingInfo: brewInfo, postBrewEvaluation: postEval };
      const result = BrewInputSchema.safeParse(payload);
      if (!result.success) {
        setSaveStatus("error");
        setError(JSON.stringify(result.error.flatten(), null, 2));
        return;
      }
      updateBrew(brewId, result.data);
      setSaveStatus("saved");
    }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brewInfo, postEval]);

  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const size = lookupGrindSize(brewInfo.grinderId, brewInfo.brewerId);
    if (size !== undefined) {
      setBrewField("grindSize", size);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brewInfo.grinderId, brewInfo.brewerId]);

  const beansG =
    brewInfo.waterG && brewInfo.brewRatio ? Math.round(brewInfo.waterG / brewInfo.brewRatio) : null;

  function setBrewField<K extends keyof BrewingInfo>(key: K, val: BrewingInfo[K] | undefined) {
    setBrewInfo((prev) => ({ ...prev, [key]: val }));
  }

  function setEvalField<K extends keyof PostBrewEvaluation>(key: K, val: PostBrewEvaluation[K] | undefined) {
    setPostEval((prev) => ({ ...prev, [key]: val }));
  }

  function numBrewInput(key: keyof BrewingInfo, val: string) {
    const n = val === "" ? undefined : parseFloat(val);
    setBrewField(key, n as never);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = { brewingInfo: brewInfo, postBrewEvaluation: postEval };

    if (brewId) {
      const result = BrewInputSchema.safeParse(payload);
      if (!result.success) {
        setError(JSON.stringify(result.error.flatten(), null, 2));
        return;
      }
      updateBrew(brewId, result.data);
    } else {
      const result = BrewSchema.safeParse({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...payload,
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
  const brewerOptions = brewers.map((b) => ({ value: b.id, label: b.name }));
  const grinderOptions = grinders.map((g) => ({ value: g.id, label: g.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Date <span className="text-stone-400">*</span>
          </label>
          <input
            type="date"
            value={brewInfo.date ?? ""}
            onChange={(e) => setBrewField("date", e.target.value)}
            required
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        <SearchableSelect
          label="Brewer"
          required
          options={brewerOptions}
          value={brewInfo.brewerId ?? ""}
          onChange={(v) => setBrewField("brewerId", v)}
          allowCustom
        />
      </div>

      <SearchableSelect
        label="Grinder"
        options={grinderOptions}
        value={brewInfo.grinderId ?? ""}
        onChange={(v) => setBrewField("grinderId", v)}
        allowCustom
        placeholder="Select grinder…"
      />

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <SearchableSelect
            label="Bean"
            required
            options={beanOptions}
            value={brewInfo.beanId ?? ""}
            onChange={(v) => setBrewField("beanId", v)}
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
            value={brewInfo.waterG ?? ""}
            onChange={(e) => numBrewInput("waterG", e.target.value)}
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
            value={brewInfo.brewRatio ?? ""}
            onChange={(e) => numBrewInput("brewRatio", e.target.value)}
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
          <GrindSizeInput
            value={brewInfo.grindSize}
            onChange={(v) => setBrewField("grindSize", v)}
            subunitsPerUnit={grinders.find((g) => g.id === brewInfo.grinderId)?.subunitsPerUnit}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1">
            <Timer size={14} /> Brew time (min) <span className="text-stone-400">*</span>
          </label>
          <input
            type="number"
            value={brewInfo.brewTimeMins ?? ""}
            onChange={(e) => numBrewInput("brewTimeMins", e.target.value)}
            placeholder="3"
            step="0.5"
            required
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 mb-1.5"
          />
          <BrewTimer
            valueMins={brewInfo.brewTimeMins}
            onChange={(mins) => setBrewField("brewTimeMins", mins)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1">
            <Thermometer size={14} /> Temp (°C)
          </label>
          <input
            type="number"
            value={brewInfo.waterTempC ?? ""}
            onChange={(e) => numBrewInput("waterTempC", e.target.value)}
            placeholder="94"
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Brewing details
        </label>
        <textarea
          value={brewInfo.notes ?? ""}
          onChange={(e) => setBrewField("notes", e.target.value)}
          rows={3}
          placeholder="Bloom 45s, scooped crust at 2min…"
          className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
        />
      </div>

      <QualityPicker
        label="Quality"
        value={postEval.quality}
        onChange={(v) => setEvalField("quality", v)}
      />

      <TasteTagPicker
        label="Taste tags"
        value={(postEval.tasteTags as TasteTag[]) ?? []}
        onChange={(tags) => setEvalField("tasteTags", tags)}
      />

      <SweetnessSlider
        label="Sweetness"
        value={postEval.sweetnessLevel}
        onChange={(v) => setEvalField("sweetnessLevel", v)}
      />

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Vibes &amp; feedback
        </label>
        <textarea
          value={postEval.vibes ?? ""}
          onChange={(e) => setEvalField("vibes", e.target.value)}
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

      <div className="flex gap-3 items-center">
        {brewId ? (
          <>
            <span className={`text-xs ${saveStatus === "error" ? "text-red-500" : "text-stone-400"}`}>
              {saveStatus === "saving" && "Saving…"}
              {saveStatus === "saved" && "Saved"}
              {saveStatus === "error" && "Save failed"}
            </span>
            <button
              type="button"
              onClick={() => router.back()}
              className="ml-auto px-4 py-2 border border-stone-200 text-stone-600 rounded-md text-sm hover:bg-stone-50 transition-colors"
            >
              Back
            </button>
          </>
        ) : (
          <>
            <button
              type="submit"
              className="flex-1 py-2 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              Log brew
            </button>
            <button
              type="button"
              onClick={() => confirmLeave() && router.back()}
              className="px-4 py-2 border border-stone-200 text-stone-600 rounded-md text-sm hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </form>
  );
}
