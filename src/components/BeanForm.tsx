"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BeanInput, BeanSchema, ROAST_LEVELS } from "@/types";
import { useData } from "@/lib/data-context";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

interface Props {
  initial?: Partial<BeanInput>;
  beanId?: string;
  onSuccess?: () => void;
}

export function BeanForm({ initial, beanId, onSuccess }: Props) {
  const router = useRouter();
  const { addBean, updateBean } = useData();
  const initialForm: Partial<BeanInput> = {
    name: "",
    origin: "",
    roastDate: "",
    roastLevel: undefined,
    notes: "",
    ...initial,
  };
  const initialSnapshot = useRef(JSON.stringify(initialForm));
  const [form, setForm] = useState<Partial<BeanInput>>(initialForm);
  const isDirty = JSON.stringify(form) !== initialSnapshot.current;
  const { confirmLeave } = useUnsavedChanges(!onSuccess ? isDirty : false);

  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof BeanInput>(key: K, val: BeanInput[K] | undefined) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (beanId) {
      const result = BeanSchema.partial().safeParse(form);
      if (!result.success) {
        setError(JSON.stringify(result.error.flatten(), null, 2));
        return;
      }
      updateBean(beanId, form);
    } else {
      const result = BeanSchema.safeParse({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...form,
      });
      if (!result.success) {
        setError(JSON.stringify(result.error.flatten(), null, 2));
        return;
      }
      addBean(result.data);
    }

    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/beans");
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
          <label className="block text-sm font-medium text-stone-700 mb-1">Origin</label>
          <input
            type="text"
            value={form.origin ?? ""}
            onChange={(e) => set("origin", e.target.value)}
            placeholder="Mexico"
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Roast level</label>
          <select
            value={form.roastLevel ?? ""}
            onChange={(e) =>
              set("roastLevel", (e.target.value as typeof ROAST_LEVELS[number]) || undefined)
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
        <label className="block text-sm font-medium text-stone-700 mb-1">Roast date</label>
        <input
          type="date"
          value={form.roastDate ?? ""}
          onChange={(e) => set("roastDate", e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
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
          className="flex-1 py-2 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          {beanId ? "Update bean" : "Add bean"}
        </button>
        {!onSuccess && (
          <button
            type="button"
            onClick={() => confirmLeave() && router.back()}
            className="px-4 py-2 border border-stone-200 text-stone-600 rounded-md text-sm hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
