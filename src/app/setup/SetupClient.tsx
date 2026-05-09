"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, FilePlus, CircleNotch } from "@phosphor-icons/react";

type Mode = "create" | "open";

export function SetupClient() {
  const router = useRouter();
  const [loading, setLoading] = useState<Mode | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePick(action: Mode) {
    setLoading(action);
    setError(null);
    try {
      // Open native macOS file picker
      const pickRes = await fetch("/api/setup/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const { filePath } = await pickRes.json();
      if (!filePath) return; // User cancelled

      // Create or connect the file
      const setupRes = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, filePath }),
      });
      const data = await setupRes.json();
      if (!setupRes.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">Coffee Tracker</h1>
          <p className="text-stone-500 text-sm mt-1">
            Choose a JSON file to store your brews and beans.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(["create", "open"] as Mode[]).map((action) => {
            const isLoading = loading === action;
            const Icon = action === "create" ? FilePlus : FolderOpen;
            const label = action === "create" ? "Create new file" : "Open existing";
            const sub = action === "create" ? "Start fresh" : "Connect to a file";

            return (
              <button
                key={action}
                onClick={() => handlePick(action)}
                disabled={loading !== null}
                className="flex flex-col items-center gap-3 p-6 border-2 border-stone-200 rounded-xl hover:border-stone-400 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center"
              >
                {isLoading ? (
                  <CircleNotch size={32} className="text-stone-400 animate-spin" />
                ) : (
                  <Icon size={32} className="text-stone-500" />
                )}
                <div>
                  <p className="font-medium text-stone-800 text-sm">{label}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {isLoading ? "Opening picker…" : sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <p className="mt-6 text-xs text-stone-400 text-center">
          Opens a Finder dialog to choose your file location.
        </p>
      </div>
    </div>
  );
}
