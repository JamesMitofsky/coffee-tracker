import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { differenceInDays, parseISO } from "date-fns";
import { Star } from "@phosphor-icons/react/dist/ssr";
import { DeleteBrewButton } from "./DeleteBrewButton";

export const dynamic = "force-dynamic";

export default async function BrewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brew = db.brews.getById(id);
  if (!brew) notFound();

  const bean = db.beans.getById(brew.beanId);
  const beansG = Math.round(brew.waterG / brew.brewRatio);

  const daysSinceRoast =
    bean?.roastDate
      ? differenceInDays(parseISO(brew.date), parseISO(bean.roastDate))
      : null;

  const rows: [string, string][] = [
    ["Date", new Date(brew.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
    ["Brewer", brew.brewer],
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
              <span
                key={tag}
                className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {brew.notes && (
        <div>
          <p className="text-sm font-medium text-stone-700 mb-2">Notes</p>
          <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">
            {brew.notes}
          </p>
        </div>
      )}
    </div>
  );
}
