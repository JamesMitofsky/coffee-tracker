"use client";

interface Props {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  label?: string;
}

const LEVEL_LABELS = ["Very bitter", "Bitter-leaning", "Balanced", "Sweet-leaning", "Very sweet"];

export function SweetnessSlider({ value, onChange, label }: Props) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-stone-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <span className="text-xs text-stone-500 w-10 shrink-0">Bitter</span>
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              title={LEVEL_LABELS[n - 1]}
              onClick={() => onChange(value === n ? undefined : n)}
              className={`flex-1 h-3 rounded-full transition-colors ${
                value !== undefined && n <= value
                  ? "bg-stone-700"
                  : "bg-stone-200 hover:bg-stone-300"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-stone-500 w-10 shrink-0 text-right">Sweet</span>
      </div>
      <div className="mt-1.5 h-4">
        {value !== undefined ? (
          <p className="text-xs text-stone-400">{LEVEL_LABELS[value - 1]}</p>
        ) : (
          <p className="text-xs text-stone-300">Not set</p>
        )}
      </div>
    </div>
  );
}
