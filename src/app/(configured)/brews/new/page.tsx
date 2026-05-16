"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useData } from "@/lib/data-context";
import { BrewForm } from "@/components/BrewForm";
import { BrewingInfo } from "@/types";

function NewBrewContent() {
  const searchParams = useSearchParams();
  const { data } = useData();
  if (!data) return null;

  const from = searchParams.get("from");
  let initial: { brewingInfo?: Partial<BrewingInfo> } | undefined;
  if (from) {
    const template = data.brews.find((b) => b.id === from);
    if (template) {
      const { brewingInfo } = template;
      const templateDate = new Date(`${brewingInfo.date}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      initial = {
        brewingInfo: {
          beanId: brewingInfo.beanId,
          brewerId: brewingInfo.brewerId,
          grinderId: brewingInfo.grinderId,
          waterG: brewingInfo.waterG,
          brewRatio: brewingInfo.brewRatio,
          grindSize: brewingInfo.grindSize,
          brewTimeMins: brewingInfo.brewTimeMins,
          waterTempC: brewingInfo.waterTempC,
          notes: `Template from ${templateDate} brew`,
        },
      };
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-stone-900 mb-6">
        {initial ? "Log brew (from template)" : "Log brew"}
      </h1>
      <BrewForm
        beans={data.beans}
        grinders={data.grinders}
        brewers={data.brewers}
        grindSizeMatrix={data.settings.grindSizeMatrix}
        defaultBrewer={data.settings.defaultBrewer}
        defaultGrinder={data.settings.defaultGrinder}
        initial={initial}
      />
    </div>
  );
}

export default function NewBrewPage() {
  return (
    <Suspense>
      <NewBrewContent />
    </Suspense>
  );
}
