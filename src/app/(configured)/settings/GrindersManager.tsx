"use client";

import { useState } from "react";
import { CaretDown, CaretRight, Trash, Plus } from "@phosphor-icons/react";
import { useData } from "@/lib/data-context";
import type { GrindPoint, Grinder } from "@/types";

function GrindCurveEditor({
  grinder,
  onClose,
}: {
  grinder: Grinder;
  onClose: () => void;
}) {
  const { updateGrinder } = useData();
  const [points, setPoints] = useState<GrindPoint[]>(
    grinder.grindCurve ?? []
  );
  const [error, setError] = useState<string | null>(null);

  function addPoint() {
    const lastStep = points.length > 0 ? points[points.length - 1].step : 0;
    setPoints((prev) => [...prev, { step: lastStep + 1, microns: 0 }]);
    setError(null);
  }

  function removePoint(idx: number) {
    setPoints((prev) => prev.filter((_, i) => i !== idx));
    setError(null);
  }

  function updatePoint(idx: number, field: keyof GrindPoint, raw: string) {
    const val = parseFloat(raw);
    setPoints((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: isNaN(val) ? 0 : val } : p))
    );
    setError(null);
  }

  function validate(): string | null {
    if (points.length === 0) return null;
    if (points.length < 2) return "Need at least 2 points for interpolation";
    const seen = new Set<number>();
    for (let i = 0; i < points.length; i++) {
      const cur = points[i];
      if (cur.microns <= 0) return `Row ${i + 1}: microns must be positive`;
      if (seen.has(cur.step)) return "Steps must be unique";
      seen.add(cur.step);
      if (i > 0 && cur.step <= points[i - 1].step)
        return "Steps must be strictly increasing";
    }
    return null;
  }

  function handleSave() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    updateGrinder(grinder.id, {
      grindCurve: points.length === 0 ? undefined : points,
    });
    onClose();
  }

  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs text-stone-400">
        Maps step → microns for non-linear grinders. Steps must be strictly increasing.
      </p>

      {points.length > 0 && (
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-stone-400 text-left">
              <th className="pr-3 pb-1 font-medium">Step</th>
              <th className="pr-3 pb-1 font-medium">Microns</th>
              <th className="pb-1" />
            </tr>
          </thead>
          <tbody>
            {points.map((p, idx) => (
              <tr key={idx}>
                <td className="pr-2 pb-1">
                  <input
                    type="number"
                    value={p.step}
                    onChange={(e) => updatePoint(idx, "step", e.target.value)}
                    step="1"
                    min="0"
                    className="w-20 px-2 py-0.5 border border-stone-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                </td>
                <td className="pr-2 pb-1">
                  <input
                    type="number"
                    value={p.microns}
                    onChange={(e) => updatePoint(idx, "microns", e.target.value)}
                    step="1"
                    min="1"
                    className="w-24 px-2 py-0.5 border border-stone-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                </td>
                <td className="pb-1">
                  <button
                    type="button"
                    onClick={() => removePoint(idx)}
                    className="text-stone-300 hover:text-red-400 transition-colors"
                    aria-label="Remove point"
                  >
                    <Trash size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {points.length === 0 && (
        <p className="text-xs text-stone-300 italic">No points — add some below.</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={addPoint}
          className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 transition-colors"
        >
          <Plus size={12} />
          Add point
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1 bg-stone-800 text-white rounded text-xs font-medium hover:bg-stone-700 transition-colors"
        >
          Save curve
        </button>
      </div>
    </div>
  );
}

export function GrindersManager() {
  const { data, addGrinder, updateGrinder, setDefaultGrinder } = useData();
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [curveOpenId, setCurveOpenId] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    addGrinder(trimmedName, shortName.trim() || undefined);
    setName("");
    setShortName("");
  }

  const grinders = data?.grinders ?? [];

  function handleMicronsBlur(grinderId: string, value: string) {
    const n = value === "" ? undefined : parseFloat(value);
    if (n !== undefined && (isNaN(n) || n <= 0)) return;
    updateGrinder(grinderId, { micronsPerUnit: n });
  }

  function handleSubunitsBlur(grinderId: string, value: string) {
    const n = value === "" ? undefined : parseInt(value, 10);
    if (n !== undefined && (!Number.isInteger(n) || n <= 0)) return;
    updateGrinder(grinderId, { subunitsPerUnit: n });
  }

  function handleRangeBlur(grinderId: string, field: "min" | "max", value: string) {
    const n = value === "" ? undefined : parseFloat(value);
    if (n !== undefined && (isNaN(n) || n < 0)) return;
    const grinder = grinders.find((g) => g.id === grinderId);
    if (!grinder) return;
    const existing = grinder.range ?? { min: 0, max: 0 };
    const updated = { ...existing, [field]: n ?? 0 };
    if (updated.min === 0 && updated.max === 0) {
      updateGrinder(grinderId, { range: undefined });
    } else if (updated.max > updated.min) {
      updateGrinder(grinderId, { range: updated });
    }
  }

  function handleSetDefault(grinderId: string) {
    const current = grinders.find((g) => g.isDefault)?.id;
    setDefaultGrinder(grinderId === current ? undefined : grinderId);
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => {
      if (prev === id) {
        setCurveOpenId(null);
        return null;
      }
      return id;
    });
  }

  function toggleCurve(id: string) {
    setCurveOpenId((prev) => (prev === id ? null : id));
  }

  const fieldClass = "w-28 px-2 py-1.5 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300";

  return (
    <div className="space-y-3">
      {grinders.length > 0 && (
        <p className="text-xs text-stone-400">Select default to pre-fill on new brews.</p>
      )}
      <ul className="divide-y divide-stone-100">
        {grinders.map((g) => (
          <li key={g.id}>
            {/* Collapsed row */}
            <div className="flex items-center gap-3 py-2">
              <button
                type="button"
                onClick={() => toggleExpand(g.id)}
                className="text-stone-300 hover:text-stone-500 transition-colors shrink-0"
                aria-label="Expand grinder settings"
              >
                {expandedId === g.id ? <CaretDown size={13} /> : <CaretRight size={13} />}
              </button>
              <input
                type="text"
                defaultValue={g.name}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v) updateGrinder(g.id, { name: v });
                }}
                className="flex-1 px-2 py-0.5 border border-transparent rounded hover:border-stone-200 focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm transition-colors"
              />
              <input
                type="text"
                defaultValue={g.shortName ?? ""}
                onBlur={(e) => updateGrinder(g.id, { shortName: e.target.value.trim() || undefined })}
                placeholder="Short name"
                className="w-28 px-2 py-0.5 border border-transparent rounded hover:border-stone-200 focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm text-stone-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => handleSetDefault(g.id)}
                className={`text-xs px-2 py-0.5 rounded transition-colors shrink-0 ${
                  g.isDefault
                    ? "bg-stone-800 text-white"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                {g.isDefault ? "Default" : "Set default"}
              </button>
            </div>

            {/* Expanded settings panel */}
            {expandedId === g.id && (
              <div className="ml-6 pb-4 pt-1 space-y-4 border-l-2 border-stone-100 pl-4">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">
                      µm per unit
                    </label>
                    <input
                      type="number"
                      defaultValue={g.micronsPerUnit ?? ""}
                      onBlur={(e) => handleMicronsBlur(g.id, e.target.value)}
                      step="1"
                      min="1"
                      placeholder="—"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">
                      Sub-clicks per click
                    </label>
                    <input
                      type="number"
                      defaultValue={g.subunitsPerUnit ?? ""}
                      onBlur={(e) => handleSubunitsBlur(g.id, e.target.value)}
                      step="1"
                      min="1"
                      placeholder="—"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">
                      Range
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={g.range?.min ?? ""}
                        onBlur={(e) => handleRangeBlur(g.id, "min", e.target.value)}
                        step="1"
                        min="0"
                        placeholder="min"
                        className="w-20 px-2 py-1.5 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                      />
                      <span className="text-stone-300">–</span>
                      <input
                        type="number"
                        defaultValue={g.range?.max ?? ""}
                        onBlur={(e) => handleRangeBlur(g.id, "max", e.target.value)}
                        step="1"
                        min="1"
                        placeholder="max"
                        className="w-20 px-2 py-1.5 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Grind curve sub-section */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleCurve(g.id)}
                    className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    {curveOpenId === g.id ? <CaretDown size={11} /> : <CaretRight size={11} />}
                    Grind curve
                    {g.grindCurve && (
                      <span className="text-stone-300 ml-0.5">{g.grindCurve.length} pts</span>
                    )}
                  </button>
                  {curveOpenId === g.id && (
                    <GrindCurveEditor
                      grinder={g}
                      onClose={() => setCurveOpenId(null)}
                    />
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
        {grinders.length === 0 && (
          <li className="text-sm text-stone-400 py-2">No grinders yet.</li>
        )}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2 pt-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Grinder name…"
          className="flex-1 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <input
          type="text"
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
          placeholder="Short name"
          className="w-28 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="px-4 py-2 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-700 disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
}
