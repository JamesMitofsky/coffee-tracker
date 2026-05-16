"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data-context";

export default function ConfiguredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasData } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!hasData) router.push("/setup");
  }, [hasData, router]);

  if (!hasData) return null;
  return <>{children}</>;
}
