import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { getMockRound, getRoundStats, getClubStats } from "@/lib/mock-data";
import { MissMap } from "@/components/dashboard/miss-map";
import { ClubTable } from "@/components/dashboard/club-table";
import { StatSummary } from "@/components/trends/stat-summary";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const round = getMockRound(id);
  const playerHoles = round.players[0]!.holes;
  const stats = getRoundStats(playerHoles);
  const clubStats = getClubStats(playerHoles);

  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="mx-auto w-full max-w-[960px]">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/rounds"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-clay transition-colors hover:bg-olive/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-cornsilk">
              {round.courseName || "Round"}
            </h1>
            <p className="text-sm text-cornsilk/50">{round.date}</p>
          </div>

          {/* Score hero */}
          <div className="ml-auto text-right">
            <span className="text-4xl font-extrabold tabular-nums text-cornsilk">
              {stats.totalScore}
            </span>
            <span className={cn("ml-2 text-xl font-bold tabular-nums", vsParColor(stats.vsPar))}>
              ({formatVsPar(stats.vsPar)})
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <StatSummary
          stats={[
            {
              label: "Score",
              value: String(stats.totalScore),
              detail: formatVsPar(stats.vsPar),
            },
            {
              label: "Putts",
              value: String(stats.totalPutts),
              detail: `${stats.puttsPerHole.toFixed(2)}/hole`,
            },
            {
              label: "GIR",
              value: `${stats.girPercent}%`,
              detail: `${stats.girCount}/${stats.girTotal}`,
            },
            {
              label: "Fairways",
              value: `${stats.fwPercent}%`,
              detail: `${stats.fwHit}/${stats.fwTotal}`,
            },
            {
              label: "Scrambling",
              value: `${stats.scramblingPercent}%`,
              detail: `${stats.scramblingConverted}/${stats.scramblingAttempts}`,
            },
            {
              label: "Penalties",
              value: String(stats.penalties),
              detail: "strokes",
            },
          ]}
        />

        {/* Miss Pattern + Club Performance in responsive layout */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Miss Pattern */}
          <div>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-cornsilk/50">
              Miss Pattern
            </h2>
            <p className="mb-3 text-xs text-cornsilk/40">Where your approaches missed relative to the pin</p>
            <MissMap holes={playerHoles} />
          </div>

          {/* Club Performance */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cornsilk/50">
              Club Performance
            </h2>
            <ClubTable clubs={clubStats} />

            {/* Export */}
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" size="sm" className="flex-1">
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button variant="secondary" size="sm" className="flex-1">
                <Download className="h-4 w-4" />
                JSON
              </Button>
            </div>
          </div>
        </div>

        {/* Link to scorecard */}
        <div className="mt-6">
          <Link
            href={`/round/${id}/scorecard`}
            className="block w-full rounded-lg border border-olive/50 bg-olive p-4 text-center text-sm font-semibold text-clay transition-colors hover:bg-olive/80"
          >
            View Full Scorecard →
          </Link>
        </div>
      </div>
    </div>
  );
}
