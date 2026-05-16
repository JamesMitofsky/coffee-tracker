"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, FilePlus } from "@phosphor-icons/react";
import { useData } from "@/lib/data-context";

export function SetupClient() {
  const router = useRouter();
  const { loadFromFile, startFresh } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await loadFromFile(file);
      router.push("/");
    } catch {
      setError("Invalid JSON file. Make sure it's a valid coffee tracker data file.");
    }
  }

  function handleStartFresh() {
    startFresh();
    router.push("/");
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
            onClick={handleStartFresh}
            className="flex flex-col items-center gap-3 p-6 border-2 border-stone-200 rounded-xl hover:border-stone-400 hover:bg-white transition-colors text-center"
          >
            <FilePlus size={32} className="text-stone-500" />
            <div>
              <p className="font-medium text-stone-800 text-sm">Start fresh</p>
              <p className="text-xs text-stone-400 mt-0.5">Empty data set</p>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 p-6 border-2 border-stone-200 rounded-xl hover:border-stone-400 hover:bg-white transition-colors text-center"
          >
            <FolderOpen size={32} className="text-stone-500" />
            <div>
              <p className="font-medium text-stone-800 text-sm">Open existing</p>
              <p className="text-xs text-stone-400 mt-0.5">Load a JSON file</p>
            </div>
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
          <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <p className="mt-6 text-xs text-stone-400 text-center">
          Data stays on your device. Export any time from settings.
        </p>
      </div>
    </div>
  );
}
