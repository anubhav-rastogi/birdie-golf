import { cn } from "@/lib/utils";
import type { HoleData } from "@/lib/mock-data";
import { getRoundStats } from "@/lib/mock-data";

function formatVsPar(vsPar: number): string {
  if (vsPar === 0) return "E";
  return vsPar > 0 ? `+${vsPar}` : `${vsPar}`;
}

function vsParColor(vsPar: number): string {
  if (vsPar <= -2) return "text-copper";
  if (vsPar === -1) return "text-clay";
  if (vsPar === 0) return "text-cornsilk";
  if (vsPar === 1) return "text-cornsilk/60";
  return "text-cornsilk/40";
}

export function RunningTotals({ holes }: { holes: HoleData[] }) {
  const stats = getRoundStats(holes);

  const items = [
    {
      value: `${stats.totalScore}`,
      extra: `(${formatVsPar(stats.vsPar)})`,
      extraColor: vsParColor(stats.vsPar),
    },
    { value: `${stats.totalPutts}`, label: "putts" },
    { value: `${stats.girCount}/${stats.girTotal}`, label: "GIR" },
    { value: `${stats.fwHit}/${stats.fwTotal}`, label: "FW" },
  ];

  return (
    <div className="sticky top-14 z-30 flex h-12 items-center justify-between border-b border-olive/30 bg-forest px-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && <div className="mx-2 h-5 w-px bg-olive/30" />}
          <span className="text-base font-bold tabular-nums text-cornsilk">{item.value}</span>
          {item.extra && (
            <span className={cn("text-sm font-semibold tabular-nums", item.extraColor)}>
              {item.extra}
            </span>
          )}
          {item.label && (
            <span className="text-xs text-cornsilk/50">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
