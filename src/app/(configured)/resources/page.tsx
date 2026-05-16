"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import type { Grinder, GrindPoint } from "@/types";

const BREW_METHODS = [
  { name: "Turkish Coffee", min: 2, max: 5 },
  { name: "Espresso", min: 6, max: 12 },
  { name: "Batch Brew Machines", min: 8, max: 23 },
  { name: "Aeropress", min: 9, max: 25 },
  { name: "Moka Pot", min: 10, max: 17 },
  { name: "Siphon", min: 10, max: 21 },
  { name: "Hario V60 Dripper", min: 11, max: 18 },
  { name: "HARIO V60 Switch", min: 12, max: 21 },
  { name: "Cupping", min: 13, max: 22 },
  { name: "Pour Over Coffee", min: 15, max: 30 },
  { name: "French Press", min: 19, max: 25 },
  { name: "Cold Brew Coffee", min: 22, max: 25 },
  { name: "Cold Drip Coffee", min: 22, max: 25 },
];

const TIMEMORE_MICRONS_PER_CLICK = 83;
const TIMEMORE_MAX_CLICKS = 35;

// Convert Timemore click ranges to microns — used as universal brew method reference
const BREW_METHODS_MICRONS = BREW_METHODS.map((m) => ({
  name: m.name,
  minMicrons: m.min * TIMEMORE_MICRONS_PER_CLICK,
  maxMicrons: m.max * TIMEMORE_MICRONS_PER_CLICK,
}));

function interpolateMicrons(step: number, curve: GrindPoint[]): number {
  if (step <= curve[0].step) return curve[0].microns;
  if (step >= curve[curve.length - 1].step) return curve[curve.length - 1].microns;
  for (let i = 0; i < curve.length - 1; i++) {
    const lo = curve[i];
    const hi = curve[i + 1];
    if (step >= lo.step && step <= hi.step) {
      const t = (step - lo.step) / (hi.step - lo.step);
      return Math.round(lo.microns + t * (hi.microns - lo.microns));
    }
  }
  return curve[curve.length - 1].microns;
}

function getMicrons(step: number, grinder: Grinder): number | null {
  if (grinder.grindCurve && grinder.grindCurve.length >= 2)
    return interpolateMicrons(step, grinder.grindCurve);
  if (grinder.micronsPerUnit) return Math.round(step * grinder.micronsPerUnit);
  return null;
}

function getSliderRange(grinder: Grinder): { min: number; max: number } {
  if (grinder.grindCurve && grinder.grindCurve.length >= 2) {
    const curve = grinder.grindCurve;
    return { min: curve[0].step, max: curve[curve.length - 1].step };
  }
  if (grinder.range) return { min: grinder.range.min, max: grinder.range.max };
  return { min: 1, max: 50 };
}

function getMaxMicrons(grinder: Grinder): number | null {
  if (grinder.grindCurve && grinder.grindCurve.length >= 2)
    return grinder.grindCurve[grinder.grindCurve.length - 1].microns;
  if (grinder.micronsPerUnit) {
    const { max } = getSliderRange(grinder);
    return Math.round(max * grinder.micronsPerUnit);
  }
  return null;
}

function BrewRangeVisualizer({
  microns,
  maxMicrons,
}: {
  microns: number;
  maxMicrons: number;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-stone-700 mb-3">Brew range visualizer</h3>
      <div className="space-y-2">
        {BREW_METHODS_MICRONS.map((method) => {
          const isCompatible =
            microns >= method.minMicrons && microns <= method.maxMicrons;
          const leftPct = Math.min((method.minMicrons / maxMicrons) * 100, 100);
          const rightPct = Math.min((method.maxMicrons / maxMicrons) * 100, 100);
          const widthPct = Math.max(rightPct - leftPct, 0);
          const markerPct = Math.min((microns / maxMicrons) * 100, 100);

          return (
            <div key={method.name} className="flex items-center gap-3 text-xs">
              <div
                className={`w-40 shrink-0 truncate ${
                  isCompatible ? "font-medium text-stone-900" : "text-stone-400"
                }`}
              >
                {method.name}
              </div>
              <div className="relative flex-1 h-5 bg-stone-100 rounded overflow-hidden">
                <div
                  className={`absolute top-0 bottom-0 rounded transition-colors duration-150 ${
                    isCompatible ? "bg-stone-300" : "bg-stone-200"
                  }`}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-stone-800 z-10 transition-all duration-100"
                  style={{ left: `calc(${markerPct}% - 1px)` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GrinderCalculator({ grinder }: { grinder: Grinder }) {
  const { min, max } = getSliderRange(grinder);
  const [step, setStep] = useState(Math.round((min + max) / 2));

  const microns = getMicrons(step, grinder);
  const maxMicrons = getMaxMicrons(grinder);
  const hasNonlinearCurve = !!grinder.grindCurve && grinder.grindCurve.length >= 2;
  const unitLabel = grinder.micronsPerUnit && !hasNonlinearCurve ? "units" : "steps";

  const compatibleMethods = microns
    ? BREW_METHODS_MICRONS.filter(
        (m) => microns >= m.minMicrons && microns <= m.maxMicrons
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-stone-900">{grinder.name}</h2>
        <p className="text-sm text-stone-500 mt-0.5">
          {hasNonlinearCurve
            ? `Non-linear curve · ${grinder.grindCurve!.length} points · steps ${min}–${max}`
            : grinder.micronsPerUnit
            ? `${grinder.micronsPerUnit} µm/unit · ${min}–${max} range`
            : `Steps ${min}–${max} · no micron data`}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-center">
          <div className="text-2xl font-bold text-stone-900">{step}</div>
          <div className="text-xs text-stone-500 mt-0.5">{unitLabel}</div>
        </div>
        {microns !== null && (
          <>
            <div className="text-stone-400 text-sm">=</div>
            <div className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-center">
              <div className="text-2xl font-bold text-stone-900">{microns}</div>
              <div className="text-xs text-stone-500 mt-0.5">microns</div>
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
        />
        <div className="flex justify-between text-xs text-stone-400">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>

      {microns !== null && (
        <>
          <div>
            <h3 className="text-sm font-medium text-stone-700 mb-2">
              Suitable methods{" "}
              <span className="text-stone-400 font-normal">({compatibleMethods.length})</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {compatibleMethods.length > 0 ? (
                compatibleMethods.map((m) => (
                  <span
                    key={m.name}
                    className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium"
                  >
                    {m.name}
                  </span>
                ))
              ) : (
                <span className="text-stone-400 text-sm italic">
                  No standard methods for this setting.
                </span>
              )}
            </div>
          </div>

          {maxMicrons !== null && (
            <BrewRangeVisualizer microns={microns} maxMicrons={maxMicrons} />
          )}
        </>
      )}
    </div>
  );
}

function TimemoreGrindCalculator() {
  const [clicks, setClicks] = useState(15);
  const microns = clicks * TIMEMORE_MICRONS_PER_CLICK;
  const maxMicrons = TIMEMORE_MAX_CLICKS * TIMEMORE_MICRONS_PER_CLICK;

  const compatibleMethods = BREW_METHODS_MICRONS.filter(
    (m) => microns >= m.minMicrons && microns <= m.maxMicrons
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-stone-900">Timemore C3 / C3 Pro</h2>
        <p className="text-sm text-stone-500 mt-0.5">
          {TIMEMORE_MICRONS_PER_CLICK} µm/click · {TIMEMORE_MAX_CLICKS} click max
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-center">
          <div className="text-2xl font-bold text-stone-900">{clicks}</div>
          <div className="text-xs text-stone-500 mt-0.5">clicks</div>
        </div>
        <div className="text-stone-400 text-sm">=</div>
        <div className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-center">
          <div className="text-2xl font-bold text-stone-900">{microns}</div>
          <div className="text-xs text-stone-500 mt-0.5">microns</div>
        </div>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min="1"
          max={TIMEMORE_MAX_CLICKS}
          value={clicks}
          onChange={(e) => setClicks(Number(e.target.value))}
          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
        />
        <div className="flex justify-between text-xs text-stone-400">
          <span>1</span>
          <span>{TIMEMORE_MAX_CLICKS}</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-stone-700 mb-2">
          Suitable methods{" "}
          <span className="text-stone-400 font-normal">({compatibleMethods.length})</span>
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {compatibleMethods.length > 0 ? (
            compatibleMethods.map((m) => (
              <span
                key={m.name}
                className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium"
              >
                {m.name}
              </span>
            ))
          ) : (
            <span className="text-stone-400 text-sm italic">
              No standard methods for this setting.
            </span>
          )}
        </div>
      </div>

      <BrewRangeVisualizer microns={microns} maxMicrons={maxMicrons} />
    </div>
  );
}

export default function ResourcesPage() {
  const { data } = useData();

  const calculableGrinders = (data?.grinders ?? []).filter(
    (g) =>
      (g.grindCurve && g.grindCurve.length >= 2) ||
      g.micronsPerUnit ||
      g.range
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Resources</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Grind calculators and reference guides
        </p>
      </div>

      {calculableGrinders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">
            Your grinders
          </h2>
          <div className="space-y-4">
            {calculableGrinders.map((g) => (
              <div key={g.id} className="border border-stone-200 rounded-xl p-6">
                <GrinderCalculator grinder={g} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">
          Reference
        </h2>
        <div className="border border-stone-200 rounded-xl p-6">
          <TimemoreGrindCalculator />
        </div>
      </div>
    </div>
  );
}
