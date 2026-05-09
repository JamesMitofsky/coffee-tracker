import { Bean } from "@/types";
import { differenceInDays, parseISO } from "date-fns";

interface Props {
  bean: Bean;
  brewCount: number;
}

export function BeanCard({ bean, brewCount }: Props) {
  const daysSinceRoast = bean.roastDate
    ? differenceInDays(new Date(), parseISO(bean.roastDate))
    : null;

  return (
    <div className="border border-stone-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-stone-900 text-sm">{bean.name}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
            {bean.origin && <span>{bean.origin}</span>}
            {bean.roastLevel && (
              <span className="capitalize">{bean.roastLevel}</span>
            )}
            {daysSinceRoast !== null && (
              <span>{daysSinceRoast}d since roast</span>
            )}
          </div>
          {bean.notes && (
            <p className="mt-1.5 text-xs text-stone-400 line-clamp-1">
              {bean.notes}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-stone-400">
            {brewCount} {brewCount === 1 ? "brew" : "brews"}
          </span>
        </div>
      </div>
    </div>
  );
}
