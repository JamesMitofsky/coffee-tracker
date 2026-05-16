"use client";

import { useState } from "react";
import { FolderOpen, FilePlus, Warning, File } from "@phosphor-icons/react";
import { useData } from "@/lib/data-context";

export function DataManager() {
  const { fileName, openFile, createFile } = useData();
  const [error, setError] = useState<string | null>(null);
  const [confirmFresh, setConfirmFresh] = useState(false);

  async function handleOpen() {
    try {
      await openFile();
      setError(null);
      setConfirmFresh(false);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Invalid file.");
    }
  }

  async function handleCreate() {
    if (!confirmFresh) {
      setConfirmFresh(true);
      return;
    }
    try {
      await createFile();
      setError(null);
      setConfirmFresh(false);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setConfirmFresh(false);
        return;
      }
      setError("Could not create file.");
    }
  }

  return (
    <div className="space-y-3">
      {fileName && (
        <div className="flex items-center gap-1.5 text-sm text-stone-500">
          <File size={14} />
          <span className="font-mono">{fileName}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-stone-300 rounded-md hover:bg-stone-50 transition-colors text-stone-700"
        >
          <FolderOpen size={15} />
          Load different file
        </button>

        <button
          type="button"
          onClick={handleCreate}
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

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 whitespace-pre-wrap font-mono">
          {error}
        </p>
      )}
    </div>
  );
}
