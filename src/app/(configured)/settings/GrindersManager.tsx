"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";

export function GrindersManager() {
  const { data, addGrinder, updateSettings } = useData();
  const [input, setInput] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = input.trim();
    if (!name) return;
    addGrinder(name);
    setInput("");
  }

  const grinders = data?.grinders ?? [];
  const defaultGrinder = data?.settings?.defaultGrinder;

  function handleSetDefault(grinder: string) {
    updateSettings({ defaultGrinder: grinder === defaultGrinder ? undefined : grinder });
  }

  return (
    <div className="space-y-3">
      {grinders.length > 0 && (
        <p className="text-xs text-stone-400">Select default to pre-fill on new brews.</p>
      )}
      <ul className="space-y-1">
        {grinders.map((g) => (
          <li
            key={g}
            className="flex items-center justify-between text-sm text-stone-700 py-1 border-b border-stone-100 last:border-0"
          >
            <span>{g}</span>
            <button
              type="button"
              onClick={() => handleSetDefault(g)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                g === defaultGrinder
                  ? "bg-stone-800 text-white"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {g === defaultGrinder ? "Default" : "Set default"}
            </button>
          </li>
        ))}
        {grinders.length === 0 && (
          <li className="text-sm text-stone-400">No grinders yet.</li>
        )}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Grinder name…"
          className="flex-1 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-4 py-2 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-700 disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
}
