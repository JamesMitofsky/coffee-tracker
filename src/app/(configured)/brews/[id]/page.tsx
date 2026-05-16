"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PencilSimple, CopySimple, Star } from "@phosphor-icons/react";
import { differenceInDays, parseISO } from "date-fns";
import { useData } from "@/lib/data-context";
import { DeleteBrewButton } from "./DeleteBrewButton";

export default function BrewPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useData();
  if (!data) return null;

  const brew = data.brews.find((b) => b.id === id);
  if (!brew) notFound();

  const bean = data.beans.find((b) => b.id === brew.beanId);
  const beansG = Math.round(brew.waterG / brew.brewRatio);

  const daysSinceRoast =
    bean?.roastDate
      ? differenceInDays(parseISO(brew.date), parseISO(bean.roastDate))
      : null;

  const rows: [string, string][] = [
    ["Date", new Date(`${brew.date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
    ["Brewer", brew.brewer],
    ...(brew.grinder ? [["Grinder", brew.grinder] as [string, string]] : []),
    ["Bean", bean?.name ?? brew.beanId],
    ...(daysSinceRoast !== null ? [["Days from roast", `${daysSinceRoast}d`] as [string, string]] : []),
    ["Water", `${brew.waterG} g`],
    ["Brew ratio", `${brew.brewRatio}:1`],
    ["Beans", `${beansG} g`],
    ["Grind size", String(brew.grindSize)],
    ["Brew time", brew.brewTimeMins ? `${brew.brewTimeMins} min` : "—"],
    ...(brew.waterTempC ? [["Water temp", `${brew.waterTempC} °C`] as [string, string]] : []),
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft size={14} />
          Back
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/brews/new?from=${id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-md text-sm text-stone-600 hover:bg-stone-50"
          >
            <CopySimple size={14} />
            Use as template
          </Link>
          <Link
            href={`/brews/${id}/edit`}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-md text-sm text-stone-600 hover:bg-stone-50"
          >
            <PencilSimple size={14} />
            Edit
          </Link>
          <DeleteBrewButton id={id} />
        </div>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">
            {bean?.name ?? "Unknown bean"}
          </h1>
          {bean?.origin && (
            <p className="text-sm text-stone-500 mt-0.5">{bean.origin}</p>
          )}
        </div>
        {brew.quality !== undefined && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: brew.quality }).map((_, i) => (
              <Star key={i} size={18} weight="fill" className="text-amber-400" />
            ))}
            {Array.from({ length: 5 - brew.quality }).map((_, i) => (
              <Star key={i} size={18} className="text-stone-200" />
            ))}
          </div>
        )}
      </div>

      <dl className="divide-y divide-stone-100 border border-stone-100 rounded-lg overflow-hidden mb-6">
        {rows.map(([label, val]) => (
          <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
            <dt className="text-stone-500">{label}</dt>
            <dd className="text-stone-900 font-medium">{val}</dd>
          </div>
        ))}
      </dl>

      {brew.tasteTags.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-stone-700 mb-2">Taste</p>
          <div className="flex flex-wrap gap-2">
            {brew.tasteTags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {brew.notes && (
        <div className="mb-6">
          <p className="text-sm font-medium text-stone-700 mb-2">Brewing details</p>
          <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">{brew.notes}</p>
        </div>
      )}

      {brew.vibes && (
        <div>
          <p className="text-sm font-medium text-stone-700 mb-2">Vibes &amp; feedback</p>
          <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">{brew.vibes}</p>
        </div>
      )}
    </div>
  );
}
