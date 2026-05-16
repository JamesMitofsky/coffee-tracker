"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { BeanForm } from "@/components/BeanForm";

export function NewBeanPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOpen = searchParams.get("new") === "1";

  if (!isOpen) return null;

  return (
    <div className="border border-stone-200 rounded-lg p-5 mb-6 bg-stone-50">
      <h2 className="text-sm font-semibold text-stone-800 mb-4">New bean</h2>
      <BeanForm onSuccess={() => router.push("/beans")} />
    </div>
  );
}
