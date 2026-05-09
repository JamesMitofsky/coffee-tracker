"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BeanInput, ROAST_LEVELS } from "@/types";

interface Props {
  initial?: Partial<BeanInput>;
  beanId?: string;
  onSuccess?: () => void;
}

export function BeanForm({ initial, beanId, onSuccess }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<BeanInput>>({
    name: "",
    origin: "",
    roastDate: "",
    roastLevel: undefined,
    notes: "",
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof BeanInput>(key: K, val: BeanInput[K] | undefined) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = beanId ? `/api/beans/${beanId}` : "/api/beans";
      const method = beanId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(JSON.stringify(data.error, null, 2));
        return;
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/beans");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Name <span className="text-stone-400">*</span>
        </label>
        <input
          type="text"
          value={form.name ?? ""}
          onChange={(e) => set("name", e.target.value)}
          required
          placeholder="Trader Joe's Mexico"
          className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Origin
          </label>
          <input
            type="text"
            value={form.origin ?? ""}
            onChange={(e) => set("origin", e.target.value)}
            placeholder="Mexico"
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Roast level
          </label>
          <select
            value={form.roastLevel ?? ""}
            onChange={(e) =>
              set("roastLevel", e.target.value as typeof ROAST_LEVELS[number] || undefined)
            }
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
          >
            <option value="">—</option>
            {ROAST_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Roast date
        </label>
        <input
          type="date"
          value={form.roastDate ?? ""}
          onChange={(e) => set("roastDate", e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Notes
        </label>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          placeholder="Chocolatey, fruity…"
          className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
        />
      </div>

      {error && (
        <pre className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3 overflow-auto">
          {error}
        </pre>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : beanId ? "Update bean" : "Add bean"}
        </button>
        {!onSuccess && (
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-stone-200 text-stone-600 rounded-md text-sm hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
