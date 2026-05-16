"use client";

import { useEffect } from "react";

export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  function confirmLeave(): boolean {
    if (!isDirty) return true;
    return window.confirm("You have unsaved changes. Leave without saving?");
  }

  return { confirmLeave };
}
