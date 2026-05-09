"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";

export function DeleteBrewButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);

  async function handleDelete() {
    await fetch(`/api/brews/${id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  if (confirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
        >
          Delete
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="px-3 py-1.5 border border-stone-200 rounded-md text-sm text-stone-600 hover:bg-stone-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-md text-sm text-stone-500 hover:text-red-600 hover:border-red-200"
    >
      <Trash size={14} />
      Delete
    </button>
  );
}
