"use client";

import { useData } from "@/lib/data-context";
import { InsightsClient } from "./InsightsClient";

export default function InsightsPage() {
  const { data } = useData();
  if (!data) return null;
  return <InsightsClient brews={data.brews} beans={data.beans} grinders={data.grinders} />;
}
