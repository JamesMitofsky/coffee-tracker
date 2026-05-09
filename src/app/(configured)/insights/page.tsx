import { db } from "@/lib/db";
import { InsightsClient } from "./InsightsClient";

export const dynamic = "force-dynamic";

export default function InsightsPage() {
  const brews = db.brews.getAll();
  const beans = db.beans.getAll();
  return <InsightsClient brews={brews} beans={beans} />;
}
