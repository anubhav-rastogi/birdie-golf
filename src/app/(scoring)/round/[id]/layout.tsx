"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeaveRoundDialog } from "@/components/scoring/leave-round-dialog";

const tabs = [
  { label: "Score", suffix: "" },
  { label: "Card", suffix: "/scorecard" },
  { label: "Stats", suffix: "/stats" },
];

export default function ScoringLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const base = `/round/${params.id}`;
  const [showLeave, setShowLeave] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* On-course header */}
      <header className="sticky top-0 z-50 border-b border-olive/30 bg-forest">
        <div className="flex h-14 items-center px-4">
          <button
            onClick={() => setShowLeave(true)}
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-clay transition-colors hover:bg-olive/50"
            aria-label="Leave round"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => {
              const href = `${base}${tab.suffix}`;
              const isActive =
                tab.suffix === ""
                  ? pathname === base
                  : pathname === href;
              return (
                <Link
                  key={tab.label}
                  href={href}
                  className={cn(
                    "focus-ring relative px-4 py-2 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "font-semibold text-clay"
                      : "text-cornsilk/50 hover:text-cornsilk/80"
                  )}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-clay transition-all duration-150" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex flex-1 flex-col animate-fade-in">{children}</main>

      {/* Leave round dialog */}
      {showLeave && (
        <LeaveRoundDialog
          onStay={() => setShowLeave(false)}
          onLeave={() => router.push("/rounds")}
        />
      )}
    </div>
  );
}
