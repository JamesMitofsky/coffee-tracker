"use client";

import { useState, useRef, useEffect } from "react";
import { MagnifyingGlass, CaretDown } from "@phosphor-icons/react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  allowCustom?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  label,
  required,
  allowCustom,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const showCustom =
    allowCustom &&
    query.length > 0 &&
    !options.some((o) => o.label.toLowerCase() === query.toLowerCase());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-sm font-medium text-stone-700 mb-1">
          {label}
          {required && <span className="text-stone-400 ml-1">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-stone-300 rounded-md bg-white text-left text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
      >
        <span className={selected ? "text-stone-900" : "text-stone-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <CaretDown size={14} className="text-stone-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-md shadow-lg">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-stone-100">
            <MagnifyingGlass size={14} className="text-stone-400 shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 text-sm outline-none bg-transparent"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-stone-50 ${
                    o.value === value ? "font-medium text-stone-900" : "text-stone-700"
                  }`}
                >
                  {o.label}
                </button>
              </li>
            ))}
            {showCustom && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onChange(query);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-stone-500 hover:bg-stone-50 italic"
                >
                  Use &ldquo;{query}&rdquo;
                </button>
              </li>
            )}
            {filtered.length === 0 && !showCustom && (
              <li className="px-3 py-2 text-sm text-stone-400">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
