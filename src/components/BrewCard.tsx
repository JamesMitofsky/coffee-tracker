import Link from "next/link";
import { Star, CopySimple } from "@phosphor-icons/react/dist/ssr";
import { Brew, Bean } from "@/types";
import { differenceInDays, parseISO } from "date-fns";
import { formatGrindSize } from "@/lib/grind-size";

interface Props {
  brew: Brew;
  bean: Bean | undefined;
  brewerName: string;
  grinderName: string | undefined;
  subunitsPerUnit?: number;
}

function daysSinceRoast(brew: Brew, bean: Bean | undefined): number | null {
  if (!bean?.roastDate) return null;
  try {
    return differenceInDays(parseISO(brew.brewingInfo.date), parseISO(bean.roastDate));
  } catch {
    return null;
  }
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
        {label}
      </span>
      <span className="text-xs font-medium text-stone-700">{value}</span>
    </div>
  );
}

export function BrewCard({ brew, bean, brewerName, grinderName, subunitsPerUnit }: Props) {
  const { brewingInfo, postBrewEvaluation } = brew;
  const beansG = Math.round(brewingInfo.waterG / brewingInfo.brewRatio);
  const days = daysSinceRoast(brew, bean);

  const stats: { label: string; value: string | number }[] = [
    { label: "Grind", value: formatGrindSize(brewingInfo.grindSize, subunitsPerUnit) },
    { label: "Dose", value: `${beansG}g` },
    { label: "Water", value: `${brewingInfo.waterG}g` },
    { label: "Ratio", value: `1:${brewingInfo.brewRatio}` },
    ...(brewingInfo.waterTempC ? [{ label: "Temp", value: `${brewingInfo.waterTempC}°C` }] : []),
    ...(brewingInfo.brewTimeMins > 0
      ? [{ label: "Time", value: `${brewingInfo.brewTimeMins}min` }]
      : []),
    { label: "Method", value: brewerName },
    ...(grinderName ? [{ label: "Grinder", value: grinderName }] : []),
  ];

  return (
    <div className="group relative border border-stone-200 rounded-lg hover:border-stone-300 hover:bg-stone-50 transition-colors">
      <Link href={`/brews/${brew.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <span className="font-semibold text-stone-900 text-sm">
              {bean?.name ?? "Unknown bean"}
            </span>
            {days !== null && (
              <span className="ml-2 text-xs text-stone-400">{days}d from roast</span>
            )}
          </div>
          <div className="shrink-0 text-right">
            {postBrewEvaluation.quality !== undefined ? (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: postBrewEvaluation.quality }).map((_, i) => (
                  <Star key={i} size={12} weight="fill" className="text-amber-400" />
                ))}
                {Array.from({ length: 5 - postBrewEvaluation.quality }).map((_, i) => (
                  <Star key={i} size={12} className="text-stone-200" />
                ))}
              </div>
            ) : (
              <span className="text-xs text-stone-300">no rating</span>
            )}
            <div className="text-xs text-stone-400 mt-1">
              {new Date(`${brewingInfo.date}T00:00:00`).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2.5 py-2.5 border-t border-b border-stone-100">
          {stats.map(({ label, value }) => (
            <Stat key={label} label={label} value={value} />
          ))}
        </div>

        {postBrewEvaluation.tasteTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {postBrewEvaluation.tasteTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {postBrewEvaluation.vibes && (
          <p className="mt-2 text-xs text-stone-400 line-clamp-2 italic">{postBrewEvaluation.vibes}</p>
        )}
      </Link>

      <Link
        href={`/brews/new?from=${brew.id}`}
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 bg-white border border-stone-200 rounded text-xs text-stone-500 hover:text-stone-800 hover:border-stone-400 transition-all"
        title="Use as template"
      >
        <CopySimple size={12} />
        Use as template
      </Link>
    </div>
  );
}
