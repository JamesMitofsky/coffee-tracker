"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PencilSimple, CopySimple, Star } from "@phosphor-icons/react";
import { differenceInDays, parseISO } from "date-fns";
import { useData } from "@/lib/data-context";
import { DeleteBrewButton } from "./DeleteBrewButton";
import { formatGrindSize } from "@/lib/grind-size";

const SWEETNESS_LABELS = ["Very bitter", "Bitter-leaning", "Balanced", "Sweet-leaning", "Very sweet"];

export default function BrewPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useData();
  if (!data) return null;

  const brew = data.brews.find((b) => b.id === id);
  if (!brew) notFound();

  const { brewingInfo, postBrewEvaluation } = brew;
  const bean = data.beans.find((b) => b.id === brewingInfo.beanId);
  const beansG = Math.round(brewingInfo.waterG / brewingInfo.brewRatio);
  const brewerMap = Object.fromEntries(data.brewers.map((b) => [b.id, b.name]));
  const grinderMap = Object.fromEntries(data.grinders.map((g) => [g.id, g.name]));
  const grinder = brewingInfo.grinderId ? data.grinders.find((g) => g.id === brewingInfo.grinderId) : undefined;

  const daysSinceRoast =
    bean?.roastDate
      ? differenceInDays(parseISO(brewingInfo.date), parseISO(bean.roastDate))
      : null;

  const rows: [string, string][] = [
    ["Date", new Date(`${brewingInfo.date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
    ["Brewer", brewerMap[brewingInfo.brewerId] ?? brewingInfo.brewerId],
    ...(brewingInfo.grinderId ? [["Grinder", grinderMap[brewingInfo.grinderId] ?? brewingInfo.grinderId] as [string, string]] : []),
    ["Bean", bean?.name ?? brewingInfo.beanId],
    ...(daysSinceRoast !== null ? [["Days from roast", `${daysSinceRoast}d`] as [string, string]] : []),
    ["Water", `${brewingInfo.waterG} g`],
    ["Brew ratio", `${brewingInfo.brewRatio}:1`],
    ["Beans", `${beansG} g`],
    ["Grind size", formatGrindSize(brewingInfo.grindSize, grinder?.subunitsPerUnit)],
    ["Brew time", brewingInfo.brewTimeMins ? `${brewingInfo.brewTimeMins} min` : "—"],
    ...(brewingInfo.waterTempC ? [["Water temp", `${brewingInfo.waterTempC} °C`] as [string, string]] : []),
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
        {postBrewEvaluation.quality !== undefined && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: postBrewEvaluation.quality }).map((_, i) => (
              <Star key={i} size={18} weight="fill" className="text-amber-400" />
            ))}
            {Array.from({ length: 5 - postBrewEvaluation.quality }).map((_, i) => (
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

      {postBrewEvaluation.tasteTags.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-stone-700 mb-2">Taste tags</p>
          <div className="flex flex-wrap gap-2">
            {postBrewEvaluation.tasteTags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {postBrewEvaluation.sweetnessLevel !== undefined && (
        <div className="mb-6">
          <p className="text-sm font-medium text-stone-700 mb-2">Sweetness</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 w-10 shrink-0">Bitter</span>
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`flex-1 h-3 rounded-full ${
                    n <= postBrewEvaluation.sweetnessLevel! ? "bg-stone-700" : "bg-stone-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-stone-500 w-10 shrink-0 text-right">Sweet</span>
          </div>
          <p className="text-xs text-stone-400 mt-1.5">{SWEETNESS_LABELS[postBrewEvaluation.sweetnessLevel - 1]}</p>
        </div>
      )}

      {brewingInfo.notes && (
        <div className="mb-6">
          <p className="text-sm font-medium text-stone-700 mb-2">Brewing details</p>
          <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">{brewingInfo.notes}</p>
        </div>
      )}

      {postBrewEvaluation.vibes && (
        <div>
          <p className="text-sm font-medium text-stone-700 mb-2">Vibes &amp; feedback</p>
          <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">{postBrewEvaluation.vibes}</p>
        </div>
      )}
    </div>
  );
}
