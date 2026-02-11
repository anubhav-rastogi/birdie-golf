"use client";

import { mockTrendData, getMockRound } from "@/lib/mock-data";
import { MiniChart } from "@/components/trends/mini-chart";
import { StatSummary } from "@/components/trends/stat-summary";
import { MissMap } from "@/components/dashboard/miss-map";

export default function TrendsPage() {
  const labels = mockTrendData.map((d) => d.date);

  const avgScore = Math.round(
    mockTrendData.reduce((s, d) => s + d.score, 0) / mockTrendData.length
  );
  const avgGIR = Math.round(
    mockTrendData.reduce((s, d) => s + d.girPercent, 0) / mockTrendData.length
  );
  const avgPutts = (
    mockTrendData.reduce((s, d) => s + d.puttsPerHole, 0) /
    mockTrendData.length
  ).toFixed(2);
  const avgScrambling = Math.round(
    mockTrendData.reduce((s, d) => s + d.scramblingPercent, 0) /
      mockTrendData.length
  );

  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="mx-auto w-full max-w-[960px]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-cornsilk">Trends</h1>
          <p className="mt-1 text-sm text-cornsilk/50">
            Across {mockTrendData.length} rounds
          </p>
        </div>

        {/* Averages */}
        <StatSummary
          stats={[
            {
              label: "Avg Score",
              value: String(avgScore),
              detail: `${mockTrendData.length} rounds`,
              trend: "down",
              trendIsGood: true,
            },
            {
              label: "Avg GIR",
              value: `${avgGIR}%`,
              detail: "Greens in regulation",
              trend: "up",
              trendIsGood: true,
            },
            {
              label: "Avg Putts/Hole",
              value: avgPutts,
              trend: "down",
              trendIsGood: true,
            },
            {
              label: "Avg Scrambling",
              value: `${avgScrambling}%`,
              detail: "Up-and-down saves",
              trend: "up",
              trendIsGood: true,
            },
            {
              label: "Best Round",
              value: "72",
              detail: "Spyglass Hill · Jan 20",
            },
            {
              label: "Rounds Played",
              value: String(mockTrendData.length),
              detail: "Since Dec 30",
            },
          ]}
        />

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <MiniChart
            title="Score Over Time"
            data={mockTrendData.map((d) => d.score)}
            labels={labels}
            invertBetter
          />
          <MiniChart
            title="GIR %"
            data={mockTrendData.map((d) => d.girPercent)}
            labels={labels}
            unit="%"
            formatValue={(v) => `${Math.round(v)}`}
          />
          <MiniChart
            title="Putts per Hole"
            data={mockTrendData.map((d) => d.puttsPerHole)}
            labels={labels}
            formatValue={(v) => v.toFixed(2)}
            invertBetter
          />
          <MiniChart
            title="Scrambling %"
            data={mockTrendData.map((d) => d.scramblingPercent)}
            labels={labels}
            unit="%"
            formatValue={(v) => `${Math.round(v)}`}
          />
        </div>

        {/* Cumulative miss map */}
        <div className="mt-6">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-cornsilk/50">
            Career Miss Pattern
          </h2>
          <p className="mb-3 text-xs text-cornsilk/40">
            Where your approaches missed relative to the pin — across {mockTrendData.length} rounds
          </p>
          <MissMap holes={getMockRound("1").players[0]!.holes} />
        </div>
      </div>
    </div>
  );
}
