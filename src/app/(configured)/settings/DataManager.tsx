"use client";

import { useRef, useState } from "react";
import { FolderOpen, FilePlus, Warning } from "@phosphor-icons/react";
import { useData } from "@/lib/data-context";

export function DataManager() {
  const { data, loadFromFile, startFresh } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmFresh, setConfirmFresh] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      await loadFromFile(file);
      setError(null);
    } catch {
      setError("Invalid file — not a valid coffee tracker JSON.");
    }
  }

  function handleStartFresh() {
    if (!confirmFresh) {
      setConfirmFresh(true);
      return;
    }
    startFresh();
    setConfirmFresh(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-stone-300 rounded-md hover:bg-stone-50 transition-colors text-stone-700"
        >
          <FolderOpen size={15} />
          Load different file
        </button>

        <button
          type="button"
          onClick={handleStartFresh}
          onBlur={() => setConfirmFresh(false)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm border rounded-md transition-colors ${confirmFresh
            ? "border-red-400 bg-red-50 text-red-700 hover:bg-red-100"
            : "border-stone-300 text-stone-700 hover:bg-stone-50"
            }`}
        >
          {confirmFresh ? (
            <>
              <Warning size={15} />
              Confirm — erase all data
            </>
          ) : (
            <>
              <FilePlus size={15} />
              Create a new brew log file
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFile}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
