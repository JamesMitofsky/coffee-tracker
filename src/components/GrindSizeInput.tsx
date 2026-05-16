"use client";

import { useState, useEffect } from "react";
import type { GrindSize } from "@/types";

interface Props {
  value: GrindSize | undefined;
  onChange: (v: GrindSize | undefined) => void;
  subunitsPerUnit?: number;
  required?: boolean;
  compact?: boolean;
}

export function GrindSizeInput({ value, onChange, subunitsPerUnit, required, compact }: Props) {
  const [primaryText, setPrimaryText] = useState(() =>
    value?.primary ? String(value.primary) : ""
  );

  useEffect(() => {
    setPrimaryText(value?.primary ? String(value.primary) : "");
  }, [value?.primary]);

  function handlePrimaryBlur() {
    const n = primaryText === "" ? undefined : parseInt(primaryText, 10);
    if (n === undefined || isNaN(n) || n <= 0) {
      onChange(undefined);
      return;
    }
    onChange({ primary: n, secondary: value?.secondary ?? 0 });
  }

  function handleSecondaryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const sec = parseInt(e.target.value, 10);
    if (!value?.primary || value.primary <= 0) return;
    onChange({ primary: value.primary, secondary: sec });
  }

  const fullInputClass =
    "w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const compactInputClass =
    "px-2 py-1 border border-stone-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-stone-400";
  const selectClass =
    "px-2 py-1 border border-stone-300 rounded text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-400";

  if (!subunitsPerUnit) {
    return (
      <input
        type="number"
        value={primaryText}
        onChange={(e) => setPrimaryText(e.target.value)}
        onBlur={handlePrimaryBlur}
        placeholder="—"
        step="1"
        min="1"
        required={required}
        className={compact ? `w-16 ${compactInputClass}` : fullInputClass}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={primaryText}
        onChange={(e) => setPrimaryText(e.target.value)}
        onBlur={handlePrimaryBlur}
        placeholder="—"
        step="1"
        min="1"
        required={required}
        className={`w-20 ${compactInputClass}`}
      />
      <select
        value={value?.secondary ?? 0}
        onChange={handleSecondaryChange}
        disabled={!value?.primary || value.primary <= 0}
        className={selectClass}
      >
        {Array.from({ length: subunitsPerUnit + 1 }, (_, i) => i).map((n) => (
          <option key={n} value={n}>
            {n === 0 ? "—" : `·${n}`}
          </option>
        ))}
      </select>
    </div>
  );
}
