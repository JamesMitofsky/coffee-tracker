"use client";

import { useData } from "@/lib/data-context";
import type { GrindPoint, GrindSize } from "@/types";
import { GrindSizeInput } from "@/components/GrindSizeInput";
import { normalizeGrindSize } from "@/lib/grind-size";

function interpolateCurve(curve: GrindPoint[], step: number): number {
  if (step <= curve[0].step) return curve[0].microns;
  const last = curve[curve.length - 1];
  if (step >= last.step) return last.microns;
  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1];
    const curr = curve[i];
    if (step <= curr.step) {
      const t = (step - prev.step) / (curr.step - prev.step);
      return Math.round(prev.microns + t * (curr.microns - prev.microns));
    }
  }
  return last.microns;
}

export function GrindSizeMatrix() {
  const { data, setGrindSizeEntry } = useData();

  const grinders = data?.grinders ?? [];
  const brewers = data?.brewers ?? [];
  const matrix = data?.settings?.grindSizeMatrix ?? [];

  if (grinders.length === 0 || brewers.length === 0) {
    return (
      <p className="text-sm text-stone-400">
        Add grinders and brewers below to configure preferred grind sizes per combination.
      </p>
    );
  }

  function getCellValue(grinderId: string, brewerId: string): GrindSize | undefined {
    return matrix.find((e) => e.grinderId === grinderId && e.brewerId === brewerId)?.grindSize;
  }

  function getMicrons(grinderId: string, brewerId: string): number | null {
    const entry = matrix.find((e) => e.grinderId === grinderId && e.brewerId === brewerId);
    if (!entry) return null;
    const grinder = grinders.find((g) => g.id === grinderId);
    if (!grinder) return null;
    const normalized = normalizeGrindSize(entry.grindSize, grinder.subunitsPerUnit);
    if (grinder.grindCurve && grinder.grindCurve.length >= 2) {
      return interpolateCurve(grinder.grindCurve, normalized);
    }
    if (grinder.micronsPerUnit) {
      return Math.round(normalized * grinder.micronsPerUnit);
    }
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left font-medium text-stone-400 pr-6 pb-3" />
            {grinders.map((g) => (
              <th key={g.id} className="font-medium text-stone-500 px-3 pb-3 text-center whitespace-nowrap">
                {g.shortName ?? g.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {brewers.map((b) => (
            <tr key={b.id}>
              <td className="font-medium text-stone-700 pr-6 py-1.5 whitespace-nowrap">{b.name}</td>
              {grinders.map((g) => {
                const microns = getMicrons(g.id, b.id);
                return (
                  <td key={g.id} className="px-3 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <GrindSizeInput
                        value={getCellValue(g.id, b.id)}
                        onChange={(v) => setGrindSizeEntry(g.id, b.id, v)}
                        subunitsPerUnit={g.subunitsPerUnit}
                        compact
                      />
                      {microns !== null && (
                        <span className="text-xs text-stone-400 whitespace-nowrap">{microns}µm</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
