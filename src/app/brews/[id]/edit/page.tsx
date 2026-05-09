import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { BrewForm } from "@/components/BrewForm";

export const dynamic = "force-dynamic";

export default async function EditBrewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brew = db.brews.getById(id);
  if (!brew) notFound();

  const beans = db.beans.getAll();
  const settings = db.settings.get();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/brews/${id}`}
        className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-6"
      >
        <ArrowLeft size={14} />
        Back
      </Link>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Edit brew</h1>
      <BrewForm
        beans={beans}
        brewId={id}
        initial={brew}
        defaultBrewer={settings.defaultBrewer}
        preferredGrindSize={settings.preferredGrindSize}
      />
    </div>
  );
}
