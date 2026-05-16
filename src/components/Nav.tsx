"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, Leaf, ChartLine, BookOpen, Gear, CloudCheck, Warning } from "@phosphor-icons/react";
import { useData } from "@/lib/data-context";

const links = [
  { href: "/", label: "Log", icon: Coffee },
  { href: "/beans", label: "Beans", icon: Leaf },
  { href: "/insights", label: "Insights", icon: ChartLine },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Gear },
];

export function Nav() {
  const pathname = usePathname();
  const { fileName } = useData();

  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-800 text-sm tracking-wide">
            Coffee Tracker
          </span>
          {fileName ? (
            <span className="relative group flex items-center text-emerald-600 cursor-default">
              <CloudCheck size={14} weight="fill" />
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-max max-w-[200px] rounded-md bg-stone-800 px-2.5 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal text-center">
                Synced to {fileName}
              </span>
            </span>
          ) : (
            <span className="relative group flex items-center text-amber-500 cursor-default">
              <Warning size={14} weight="fill" />
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-max max-w-[200px] rounded-md bg-stone-800 px-2.5 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal text-center">
                No file — changes saved to local storage only
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/" || pathname.startsWith("/brews")
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${active
                    ? "bg-stone-100 text-stone-900 font-medium"
                    : "text-stone-500 hover:text-stone-700 hover:bg-stone-50"
                  }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
