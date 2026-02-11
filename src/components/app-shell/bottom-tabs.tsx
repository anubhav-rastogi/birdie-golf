"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, TrendingUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    label: "Rounds",
    href: "/rounds",
    icon: ClipboardList,
  },
  {
    label: "New Round",
    href: "/new-round",
    icon: Plus,
    isCta: true,
  },
  {
    label: "Trends",
    href: "/trends",
    icon: TrendingUp,
  },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-olive/30 bg-forest/95 backdrop-blur-md lg:hidden">
      <div className="flex items-end justify-around pb-[env(safe-area-inset-bottom,0px)]">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/new-round"
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(tab.href + "/");

          if (tab.isCta) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center pb-2 pt-1.5"
              >
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full",
                    "bg-clay text-forest shadow-sm",
                    "transition-all duration-150 active:scale-95 active:bg-copper"
                  )}
                >
                  <tab.icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-w-[64px] flex-col items-center gap-0.5 pb-2 pt-2.5",
                "transition-colors duration-150"
              )}
            >
              <tab.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-clay" : "text-cornsilk/40"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-clay" : "text-cornsilk/40"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
