import type { GrindSize } from "@/types";

export function normalizeGrindSize(size: GrindSize, subunitsPerUnit?: number): number {
  return size.primary + size.secondary / (subunitsPerUnit ?? 1);
}

export function formatGrindSize(size: GrindSize, subunitsPerUnit?: number): string {
  if (size.secondary === 0 || !subunitsPerUnit) return String(size.primary);
  return `${size.primary}·${size.secondary}`;
}
