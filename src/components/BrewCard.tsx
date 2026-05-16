import Link from "next/link";
import { Star, CopySimple } from "@phosphor-icons/react/dist/ssr";
import { Brew, Bean } from "@/types";
import { differenceInDays, parseISO } from "date-fns";

interface Props {
  brew: Brew;
  bean: Bean | undefined;
}

function daysSinceRoast(brew: Brew, bean: Bean | undefined): number | null {
  if (!bean?.roastDate) return null;
  try {
    return differenceInDays(parseISO(brew.date), parseISO(bean.roastDate));
  } catch {
    return null;
  }
}

export function BrewCard({ brew, bean }: Props) {
  const beansG = Math.round(brew.waterG / brew.brewRatio);
  const days = daysSinceRoast(brew, bean);

  return (
    <div className="group relative border border-stone-200 rounded-lg hover:border-stone-300 hover:bg-stone-50 transition-colors">
      <Link href={`/brews/${brew.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-stone-900 text-sm truncate">
                {bean?.name ?? "Unknown bean"}
              </span>
              {days !== null && (
                <span className="text-xs text-stone-400 shrink-0">
                  {days}d from roast
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span>{brew.brewer}</span>
              <span>
                {beansG}g / {brew.waterG}g ({brew.brewRatio}:1)
              </span>
              <span>grind {brew.grindSize}</span>
              {brew.brewTimeMins > 0 && <span>{brew.brewTimeMins}min</span>}
              {brew.waterTempC && <span>{brew.waterTempC}°C</span>}
            </div>
            {brew.tasteTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {brew.tasteTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {brew.notes && (
              <p className="mt-1.5 text-xs text-stone-400 line-clamp-2">
                {brew.notes}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            {brew.quality !== undefined ? (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: brew.quality }).map((_, i) => (
                  <Star key={i} size={12} weight="fill" className="text-amber-400" />
                ))}
                {Array.from({ length: 5 - brew.quality }).map((_, i) => (
                  <Star key={i} size={12} className="text-stone-200" />
                ))}
              </div>
            ) : (
              <span className="text-xs text-stone-300">no rating</span>
            )}
            <div className="text-xs text-stone-400 mt-1">
              {new Date(`${brew.date}T00:00:00`).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
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
