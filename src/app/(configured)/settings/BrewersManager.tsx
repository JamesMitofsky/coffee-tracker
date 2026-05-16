"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";

export function BrewersManager() {
  const { data, addBrewer, updateSettings } = useData();
  const [input, setInput] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = input.trim();
    if (!name) return;
    addBrewer(name);
    setInput("");
  }

  const brewers = data?.brewers ?? [];
  const defaultBrewer = data?.settings?.defaultBrewer;

  function handleSetDefault(brewer: string) {
    updateSettings({ defaultBrewer: brewer === defaultBrewer ? undefined : brewer });
  }

  return (
    <div className="space-y-3">
      {brewers.length > 0 && (
        <p className="text-xs text-stone-400">Select default to pre-fill on new brews.</p>
      )}
      <ul className="space-y-1">
        {brewers.map((b) => (
          <li
            key={b}
            className="flex items-center justify-between text-sm text-stone-700 py-1 border-b border-stone-100 last:border-0"
          >
            <span>{b}</span>
            <button
              type="button"
              onClick={() => handleSetDefault(b)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                b === defaultBrewer
                  ? "bg-stone-800 text-white"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {b === defaultBrewer ? "Default" : "Set default"}
            </button>
          </li>
        ))}
        {brewers.length === 0 && (
          <li className="text-sm text-stone-400">No brewers yet.</li>
        )}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Brewer name…"
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
