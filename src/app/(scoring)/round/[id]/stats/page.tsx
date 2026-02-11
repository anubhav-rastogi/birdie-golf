"use client";

import { useParams } from "next/navigation";
import { getMockRound, getRoundStats, getClubStats } from "@/lib/mock-data";
import { StatSummary } from "@/components/trends/stat-summary";
import { MissMap } from "@/components/dashboard/miss-map";
import { ClubTable } from "@/components/dashboard/club-table";
import { cn } from "@/lib/utils";

function formatVsPar(vsPar: number): string {
  if (vsPar === 0) return "E";
  return vsPar > 0 ? `+${vsPar}` : `${vsPar}`;
}

export default function StatsPage() {
  const params = useParams<{ id: string }>();
  const round = getMockRound(params.id);
  const holes = round.players[0]!.holes;
  const stats = getRoundStats(holes);
  const clubStats = getClubStats(holes);

  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="mx-auto w-full max-w-[960px]">
        {/* Header */}
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <h1 className="text-lg font-bold text-cornsilk">
              {round.courseName || "Round"} — Live Stats
            </h1>
            <p className="text-sm text-cornsilk/50">
              {holes.length} holes played
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold tabular-nums text-cornsilk">
              {stats.totalScore}
            </span>
            <span className={cn("ml-1.5 text-lg font-bold tabular-nums", stats.vsPar <= 0 ? "text-clay" : "text-cornsilk/50")}>
              ({formatVsPar(stats.vsPar)})
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <StatSummary
          stats={[
            { label: "Score", value: String(stats.totalScore), detail: formatVsPar(stats.vsPar) },
            { label: "Putts", value: String(stats.totalPutts), detail: `${stats.puttsPerHole.toFixed(2)}/hole` },
            { label: "GIR", value: `${stats.girPercent}%`, detail: `${stats.girCount}/${stats.girTotal}` },
            { label: "Fairways", value: `${stats.fwPercent}%`, detail: `${stats.fwHit}/${stats.fwTotal}` },
            { label: "Scrambling", value: `${stats.scramblingPercent}%`, detail: `${stats.scramblingConverted}/${stats.scramblingAttempts}` },
            { label: "Penalties", value: String(stats.penalties), detail: "strokes" },
          ]}
        />

        {/* Miss map + club table */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-cornsilk/50">
              Miss Pattern
            </h2>
            <p className="mb-3 text-xs text-cornsilk/40">Where your approaches missed relative to the pin</p>
            <MissMap holes={holes} />
          </div>
          {clubStats.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cornsilk/50">
                Club Performance
              </h2>
              <ClubTable clubs={clubStats} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
