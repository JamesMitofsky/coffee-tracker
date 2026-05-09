"use client";

import { TASTE_TAGS, TasteTag } from "@/types";

interface Props {
  value: TasteTag[];
  onChange: (tags: TasteTag[]) => void;
  label?: string;
  counts?: Record<TasteTag, number>;
}

export function TasteTagPicker({ value, onChange, label, counts }: Props) {
  function toggle(tag: TasteTag) {
    onChange(
      value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]
    );
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-stone-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {TASTE_TAGS.map((tag) => {
          const active = value.includes(tag);
          const count = counts?.[tag];
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? "border-stone-700 bg-stone-800 text-white"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
              }`}
            >
              <span>{tag}</span>
              {count !== undefined && (
                <span
                  className={`text-xs ${
                    active ? "text-stone-300" : "text-stone-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
