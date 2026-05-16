"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useData } from "@/lib/data-context";
import { BrewForm } from "@/components/BrewForm";
import { BrewInput } from "@/types";

function NewBrewContent() {
  const searchParams = useSearchParams();
  const { data } = useData();
  if (!data) return null;

  const from = searchParams.get("from");
  let initial: Partial<BrewInput> | undefined;
  if (from) {
    const template = data.brews.find((b) => b.id === from);
    if (template) {
      initial = {
        beanId: template.beanId,
        brewer: template.brewer,
        grinder: template.grinder,
        waterG: template.waterG,
        brewRatio: template.brewRatio,
        grindSize: template.grindSize,
        brewTimeMins: template.brewTimeMins,
        waterTempC: template.waterTempC,
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
        defaultBrewer={data.settings.defaultBrewer}
        defaultGrinder={data.settings.defaultGrinder}
        preferredGrindSize={data.settings.preferredGrindSize}
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
