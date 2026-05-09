"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, FilePlus } from "@phosphor-icons/react";

type Mode = "create" | "open" | null;

export function SetupClient({ suggestedPath }: { suggestedPath: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [filePath, setFilePath] = useState(suggestedPath);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(action: "create" | "open") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, filePath }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">Coffee Tracker</h1>
          <p className="text-stone-500 text-sm mt-1">
            Choose a JSON file to store your brews and beans.
          </p>
        </div>

        {mode === null ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setMode("create");
                setFilePath(suggestedPath);
                setError(null);
              }}
              className="flex flex-col items-center gap-3 p-6 border-2 border-stone-200 rounded-xl hover:border-stone-400 hover:bg-white transition-colors text-center"
            >
              <FilePlus size={32} className="text-stone-500" />
              <div>
                <p className="font-medium text-stone-800 text-sm">Create new file</p>
                <p className="text-xs text-stone-400 mt-0.5">Start fresh</p>
              </div>
            </button>
            <button
              onClick={() => {
                setMode("open");
                setFilePath("");
                setError(null);
              }}
              className="flex flex-col items-center gap-3 p-6 border-2 border-stone-200 rounded-xl hover:border-stone-400 hover:bg-white transition-colors text-center"
            >
              <FolderOpen size={32} className="text-stone-500" />
              <div>
                <p className="font-medium text-stone-800 text-sm">Open existing</p>
                <p className="text-xs text-stone-400 mt-0.5">Connect to a file</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              {mode === "create" ? (
                <FilePlus size={18} className="text-stone-500" />
              ) : (
                <FolderOpen size={18} className="text-stone-500" />
              )}
              <h2 className="font-medium text-stone-800 text-sm">
                {mode === "create" ? "Create new file" : "Open existing file"}
              </h2>
              <button
                onClick={() => {
                  setMode(null);
                  setError(null);
                }}
                className="ml-auto text-xs text-stone-400 hover:text-stone-600"
              >
                Back
              </button>
            </div>

            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              File path
            </label>
            <input
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="/Users/you/Documents/coffee-brews.json"
              spellCheck={false}
              className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-stone-400 mb-1"
            />
            <p className="text-xs text-stone-400 mb-5">
              {mode === "create"
                ? "File will be created at this path. Parent directory must exist."
                : "Paste the absolute path to your existing JSON file."}
            </p>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <button
              onClick={() => handleSubmit(mode)}
              disabled={loading || !filePath.trim()}
              className="w-full py-2 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
            >
              {loading
                ? "Connecting…"
                : mode === "create"
                ? "Create & connect"
                : "Open & connect"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
