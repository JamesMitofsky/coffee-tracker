"use client";

import { Star } from "@phosphor-icons/react";

interface Props {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  label?: string;
}

export function QualityPicker({ value, onChange, label }: Props) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-stone-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? undefined : n)}
            className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-stone-400"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              size={24}
              weight={value !== undefined && n <= value ? "fill" : "regular"}
              className={
                value !== undefined && n <= value
                  ? "text-amber-400"
                  : "text-stone-300"
              }
            />
          </button>
        ))}
        {value !== undefined && (
          <span className="ml-2 text-sm text-stone-400">{value}/5</span>
        )}
      </div>
    </div>
  );
}
