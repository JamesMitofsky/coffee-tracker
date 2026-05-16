"use client";

import { Brew, Bean, Grinder, TASTE_TAGS, TasteTag } from "@/types";
import { normalizeGrindSize, formatGrindSize } from "@/lib/grind-size";

interface Props {
  brews: Brew[];
  beans: Bean[];
  grinders: Grinder[];
}

interface GrindStat {
  normalizedSize: number;
  displayLabel: string;
  avgQuality: number;
  count: number;
}

export function InsightsClient({ brews, beans, grinders }: Props) {
  const beanMap = Object.fromEntries(beans.map((b) => [b.id, b]));
  const grinderMap = Object.fromEntries(grinders.map((g) => [g.id, g]));
  const ratedBrews = brews.filter((b) => b.postBrewEvaluation.quality !== undefined);

  if (brews.length < 3) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-stone-900 mb-2">Insights</h1>
        <p className="text-sm text-stone-400">
          Log at least 3 brews to see patterns.
        </p>
      </div>
    );
  }

  const grindGroups = ratedBrews.reduce<Record<number, { qualities: number[]; displayLabel: string }>>((acc, b) => {
    const grinder = b.brewingInfo.grinderId ? grinderMap[b.brewingInfo.grinderId] : undefined;
    const key = normalizeGrindSize(b.brewingInfo.grindSize, grinder?.subunitsPerUnit);
    const label = formatGrindSize(b.brewingInfo.grindSize, grinder?.subunitsPerUnit);
    if (!acc[key]) acc[key] = { qualities: [], displayLabel: label };
    acc[key].qualities.push(b.postBrewEvaluation.quality!);
    return acc;
  }, {});

  const grindStats: GrindStat[] = Object.entries(grindGroups)
    .map(([key, { qualities, displayLabel }]) => ({
      normalizedSize: parseFloat(key),
      displayLabel,
      avgQuality: qualities.reduce((a, b) => a + b, 0) / qualities.length,
      count: qualities.length,
    }))
    .sort((a, b) => a.normalizedSize - b.normalizedSize);

  const beanQuality = Object.entries(
    ratedBrews.reduce<Record<string, number[]>>((acc, b) => {
      acc[b.brewingInfo.beanId] = [...(acc[b.brewingInfo.beanId] ?? []), b.postBrewEvaluation.quality!];
      return acc;
    }, {})
  )
    .map(([beanId, qs]) => ({
      beanId,
      name: beanMap[beanId]?.name ?? beanId,
      avg: qs.reduce((a, b) => a + b, 0) / qs.length,
      count: qs.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  const tagCounts = brews.reduce<Record<TasteTag, number>>(
    (acc, b) => {
      b.postBrewEvaluation.tasteTags.forEach((t) => (acc[t] = (acc[t] ?? 0) + 1));
      return acc;
    },
    {} as Record<TasteTag, number>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-xl font-semibold text-stone-900">Insights</h1>

      {grindStats.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-stone-700 mb-3">
            Grind size vs quality
          </h2>
          <div className="space-y-2">
            {grindStats.map((s) => (
              <div key={s.normalizedSize} className="flex items-center gap-3">
                <span className="w-8 text-xs text-stone-500 text-right shrink-0">
                  {s.displayLabel}
                </span>
                <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(s.avgQuality / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-stone-500 w-20 shrink-0">
                  {s.avgQuality.toFixed(1)} avg · {s.count}×
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {beanQuality.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-stone-700 mb-3">
            Beans by quality
          </h2>
          <div className="space-y-2">
            {beanQuality.map((b) => (
              <div key={b.beanId} className="flex items-center gap-3">
                <span className="flex-1 text-xs text-stone-700 truncate">
                  {b.name}
                </span>
                <div className="w-32 bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-stone-600 rounded-full"
                    style={{ width: `${(b.avg / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-stone-500 w-20 shrink-0 text-right">
                  {b.avg.toFixed(1)} · {b.count}×
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {Object.keys(tagCounts).length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-stone-700 mb-3">
            Taste tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {TASTE_TAGS.filter((t) => tagCounts[t] > 0)
              .sort((a, b) => (tagCounts[b] ?? 0) - (tagCounts[a] ?? 0))
              .map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-sm text-stone-700"
                >
                  {tag}
                  <span className="text-stone-400 text-xs">{tagCounts[tag]}</span>
                </span>
              ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-stone-700 mb-1">Overview</h2>
        <dl className="grid grid-cols-3 gap-4 mt-3">
          {[
            ["Total brews", brews.length],
            ["Rated", ratedBrews.length],
            [
              "Avg quality",
              ratedBrews.length > 0
                ? (
                    ratedBrews.reduce((a, b) => a + b.postBrewEvaluation.quality!, 0) /
                    ratedBrews.length
                  ).toFixed(1)
                : "—",
            ],
          ].map(([label, val]) => (
            <div key={label} className="border border-stone-100 rounded-lg p-4">
              <dt className="text-xs text-stone-400">{label}</dt>
              <dd className="text-2xl font-semibold text-stone-900 mt-1">
                {val}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
