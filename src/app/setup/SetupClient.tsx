"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, FilePlus } from "@phosphor-icons/react";
import { useData } from "@/lib/data-context";

export function SetupClient() {
  const router = useRouter();
  const { openFile, createFile } = useData();
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    try {
      await openFile();
      router.push("/");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Invalid JSON file.");
    }
  }

  async function handleCreate() {
    try {
      await createFile();
      router.push("/");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Could not create file.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">Coffee Tracker</h1>
          <p className="text-stone-500 text-sm mt-1">
            Load an existing data file or start fresh.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCreate}
            className="flex flex-col items-center gap-3 p-6 border-2 border-stone-200 rounded-xl hover:border-stone-400 hover:bg-white transition-colors text-center"
          >
            <FilePlus size={32} className="text-stone-500" />
            <div>
              <p className="font-medium text-stone-800 text-sm">Start fresh</p>
              <p className="text-xs text-stone-400 mt-0.5">New JSON file</p>
            </div>
          </button>

          <button
            onClick={handleOpen}
            className="flex flex-col items-center gap-3 p-6 border-2 border-stone-200 rounded-xl hover:border-stone-400 hover:bg-white transition-colors text-center"
          >
            <FolderOpen size={32} className="text-stone-500" />
            <div>
              <p className="font-medium text-stone-800 text-sm">Open existing</p>
              <p className="text-xs text-stone-400 mt-0.5">Load a JSON file</p>
            </div>
          </button>
        </div>

        {error && (
          <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 whitespace-pre-wrap font-mono">
            {error}
          </p>
        )}

        <p className="mt-6 text-xs text-stone-400 text-center">
          All changes save automatically to your file.
        </p>
      </div>
    </div>
  );
}
