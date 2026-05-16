"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { BREW_METHODS, type BrewMethod } from "@/types";

export function BrewersManager() {
  const { data, addBrewer, updateBrewer, updateSettings } = useData();
  const [nameInput, setNameInput] = useState("");
  const [methodInput, setMethodInput] = useState<BrewMethod | "">("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    addBrewer(name, methodInput || undefined);
    setNameInput("");
    setMethodInput("");
  }

  const brewers = data?.brewers ?? [];
  const defaultBrewer = data?.settings?.defaultBrewer;

  function handleSetDefault(brewerId: string) {
    updateSettings({ defaultBrewer: brewerId === defaultBrewer ? undefined : brewerId });
  }

  function handleNameBlur(brewerId: string, value: string) {
    const name = value.trim();
    if (!name) return;
    updateBrewer(brewerId, { name });
  }

  function handleShortNameBlur(brewerId: string, value: string) {
    const shortName = value.trim() || undefined;
    updateBrewer(brewerId, { shortName });
  }

  function handleMethodChange(brewerId: string, value: string) {
    updateBrewer(brewerId, { method: (value as BrewMethod) || undefined });
  }

  return (
    <div className="space-y-3">
      {brewers.length > 0 && (
        <p className="text-xs text-stone-400">Select default to pre-fill on new brews.</p>
      )}
      <ul className="space-y-1">
        {brewers.map((b) => (
          <li
            key={b.id}
            className="flex items-center gap-3 text-sm text-stone-700 py-1 border-b border-stone-100 last:border-0"
          >
            <input
              type="text"
              defaultValue={b.name}
              onBlur={(e) => handleNameBlur(b.id, e.target.value)}
              className="flex-1 px-2 py-0.5 border border-transparent rounded hover:border-stone-200 focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm transition-colors"
            />
            <input
              type="text"
              defaultValue={b.shortName ?? ""}
              onBlur={(e) => handleShortNameBlur(b.id, e.target.value)}
              placeholder="Short name"
              className="w-24 px-2 py-0.5 border border-transparent rounded hover:border-stone-200 focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm text-stone-500 transition-colors"
            />
            <select
              value={b.method ?? ""}
              onChange={(e) => handleMethodChange(b.id, e.target.value)}
              className="w-36 px-2 py-0.5 border border-transparent rounded hover:border-stone-200 focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm text-stone-500 transition-colors bg-white"
            >
              <option value="">Method…</option>
              {BREW_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleSetDefault(b.id)}
              className={`text-xs px-2 py-0.5 rounded transition-colors shrink-0 ${
                b.id === defaultBrewer
                  ? "bg-stone-800 text-white"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {b.id === defaultBrewer ? "Default" : "Set default"}
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
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Brewer name…"
          className="flex-1 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <select
          value={methodInput}
          onChange={(e) => setMethodInput(e.target.value as BrewMethod | "")}
          className="w-36 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white text-stone-600"
        >
          <option value="">Method…</option>
          {BREW_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!nameInput.trim()}
          className="px-4 py-2 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-700 disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
}
