import { db } from "@/lib/db";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const settings = db.settings.get();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Settings</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
