"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, Leaf, ChartLine, Gear } from "@phosphor-icons/react";

const links = [
  { href: "/", label: "Log", icon: Coffee },
  { href: "/beans", label: "Beans", icon: Leaf },
  { href: "/insights", label: "Insights", icon: ChartLine },
  { href: "/settings", label: "Settings", icon: Gear },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="font-semibold text-stone-800 text-sm tracking-wide">
          Coffee Tracker
        </span>
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  active
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
