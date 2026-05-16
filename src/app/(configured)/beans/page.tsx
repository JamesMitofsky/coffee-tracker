"use client";

import Link from "next/link";
import { Plus, Leaf } from "@phosphor-icons/react";
import { Suspense } from "react";
import { useData } from "@/lib/data-context";
import { BeanCard } from "./BeanCard";
import { NewBeanPanel } from "./NewBeanPanel";

export default function BeansPage() {
  const { data } = useData();
  if (!data) return null;

  const beans = [...data.beans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const brewCountByBean = data.brews.reduce<Record<string, number>>((acc, brew) => {
    acc[brew.beanId] = (acc[brew.beanId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Beans</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {beans.length} {beans.length === 1 ? "bean" : "beans"} in your library
          </p>
        </div>
        <Link
          href="/beans?new=1"
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          <Plus size={16} />
          Add bean
        </Link>
      </div>

      <Suspense>
        <NewBeanPanel />
      </Suspense>

      {beans.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Leaf size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No beans yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {beans.map((bean) => (
            <BeanCard
              key={bean.id}
              bean={bean}
              brewCount={brewCountByBean[bean.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
