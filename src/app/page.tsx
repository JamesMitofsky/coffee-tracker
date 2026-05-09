import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { BrewCard } from "@/components/BrewCard";

export const dynamic = "force-dynamic";

export default function Home() {
  const brews = db.brews
    .getAll()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const beans = db.beans.getAll();
  const beanMap = Object.fromEntries(beans.map((b) => [b.id, b]));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Brew log</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {brews.length} {brews.length === 1 ? "brew" : "brews"} recorded
          </p>
        </div>
        <Link
          href="/brews/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          <Plus size={16} />
          Log brew
        </Link>
      </div>

      {brews.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-sm">No brews yet.</p>
          <Link
            href="/brews/new"
            className="mt-3 inline-block text-sm text-stone-600 underline underline-offset-2"
          >
            Log your first brew
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {brews.map((brew) => (
            <BrewCard key={brew.id} brew={brew} bean={beanMap[brew.beanId]} />
          ))}
        </div>
      )}
    </div>
  );
}
