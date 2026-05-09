import { db } from "@/lib/db";
import { BrewForm } from "@/components/BrewForm";

export const dynamic = "force-dynamic";

export default function NewBrewPage() {
  const beans = db.beans.getAll();
  const settings = db.settings.get();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Log brew</h1>
      <BrewForm
        beans={beans}
        defaultBrewer={settings.defaultBrewer}
        preferredGrindSize={settings.preferredGrindSize}
      />
    </div>
  );
}
