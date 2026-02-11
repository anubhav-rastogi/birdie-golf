import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RoundSummary } from "@/components/round-list";

function formatVsPar(vsPar: number): string {
  if (vsPar === 0) return "E";
  if (vsPar > 0) return `+${vsPar}`;
  return `${vsPar}`;
}

function vsParColor(vsPar: number): string {
  if (vsPar <= -2) return "text-copper";
  if (vsPar === -1) return "text-clay";
  if (vsPar === 0) return "text-cornsilk";
  if (vsPar === 1) return "text-cornsilk/60";
  return "text-cornsilk/40";
}

export function RoundCard({
  round,
  isSelected = false,
}: {
  round: RoundSummary;
  isSelected?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  // Scroll into view when selected via keyboard
  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isSelected]);

  return (
    <Link
      ref={ref}
      href={`/rounds/${round.id}`}
      className={cn(
        "block w-full rounded-lg border p-4 transition-all duration-150",
        isSelected
          ? "border-clay bg-olive ring-2 ring-clay/30 scale-[1.01]"
          : "border-olive/50 bg-olive hover:bg-olive/80 active:bg-olive/70"
      )}
    >
      {/* Line 1: Course name + date */}
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="truncate text-base font-semibold text-cornsilk">
          {round.courseName || "Round"}
        </h3>
        <span className="shrink-0 text-xs text-cornsilk/40">{round.date}</span>
      </div>

      {/* Line 2: Score vs par + key stats */}
      <div className="mt-1.5 flex items-center gap-1.5 text-xs">
        <span
          className={cn(
            "text-xl font-bold tabular-nums leading-none",
            vsParColor(round.vsPar)
          )}
        >
          {round.score}
        </span>
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            vsParColor(round.vsPar)
          )}
        >
          ({formatVsPar(round.vsPar)})
        </span>
        <span className="mx-1 text-cornsilk/30">&middot;</span>
        <span className="text-cornsilk/60">{round.girPercent}% GIR</span>
        <span className="text-cornsilk/30">&middot;</span>
        <span className="text-cornsilk/60">{round.fwPercent}% FW</span>
        <span className="text-cornsilk/30">&middot;</span>
        <span className="text-cornsilk/60">{round.putts} putts</span>
      </div>
    </Link>
  );
}
