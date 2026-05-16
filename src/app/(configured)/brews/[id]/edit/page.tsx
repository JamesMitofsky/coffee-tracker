"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { useData } from "@/lib/data-context";
import { BrewForm } from "@/components/BrewForm";

export default function EditBrewPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useData();
  if (!data) return null;

  const brew = data.brews.find((b) => b.id === id);
  if (!brew) notFound();

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
        beans={data.beans}
        grinders={data.grinders}
        brewers={data.brewers}
        grindSizeMatrix={data.settings.grindSizeMatrix}
        brewId={id}
        initial={{
          brewingInfo: brew.brewingInfo,
          postBrewEvaluation: brew.postBrewEvaluation,
        }}
        defaultBrewer={data.settings.defaultBrewer}
        defaultGrinder={data.settings.defaultGrinder}
      />
    </div>
  );
}
