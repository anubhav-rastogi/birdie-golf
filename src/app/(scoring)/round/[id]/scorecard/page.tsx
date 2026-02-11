"use client";

import React from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getMockRound } from "@/lib/mock-data";
import type { HoleData } from "@/lib/mock-data";

function scoreDecoration(diff: number): string {
  if (diff <= -2) return "rounded-full border-2 border-clay";           // eagle+ — double circle (or circle)
  if (diff === -1) return "rounded-full border-2 border-clay";          // birdie — circle
  if (diff === 0) return "";                                            // par — no decoration
  if (diff === 1) return "border-2 border-forest";                      // bogey — box
  return "border-2 border-forest";                                      // double+ — box
}

function scoreColor(diff: number): string {
  if (diff <= 0 && diff !== 0) return "font-bold text-clay";            // birdie or better — bold yellow
  if (diff === 0) return "font-bold text-cornsilk";                     // par — bold neutral
  return "font-bold text-forest";                                       // bogey+ — bold black
}

function girSymbol(gir: string) {
  if (gir === "hit") return { text: "✓", color: "text-clay" };
  return { text: "✗", color: "text-cornsilk/40" };
}

function fwSymbol(fw: string | null, par: number) {
  if (par < 4) return { text: "", color: "" };
  if (fw === "hit") return { text: "✓", color: "text-clay" };
  if (fw === "left") return { text: "←", color: "text-cornsilk/60" };
  if (fw === "right") return { text: "→", color: "text-cornsilk/60" };
  return { text: "–", color: "text-cornsilk/30" };
}

export default function ScorecardPage() {
  const params = useParams<{ id: string }>();
  const round = getMockRound(params.id);
  const holeCount = round.players[0]!.holes.length;
  const front9 = Math.min(holeCount, 9);
  const has18 = holeCount > 9;

  return (
    <div className="flex-1 px-2 py-4 sm:px-4">
      <div className="mx-auto w-full max-w-[960px]">
        {/* Landscape hint */}
        <div className="mb-3 rounded-lg bg-olive/30 px-3 py-2 text-center text-xs text-cornsilk/40 sm:hidden">
          📱↔ Rotate for best view
        </div>

        <div className="overflow-x-auto rounded-xl border border-olive/50">
          <table className="w-full border-collapse text-center">
            {/* Front 9 */}
            <ScorecardHalf
              label="OUT"
              startHole={0}
              endHole={front9}
              players={round.players}
            />

            {/* Back 9 */}
            {has18 && (
              <ScorecardHalf
                label="IN"
                startHole={9}
                endHole={holeCount}
                players={round.players}
                showTotal
              />
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

function ScorecardHalf({
  label,
  startHole,
  endHole,
  players,
  showTotal = false,
}: {
  label: string;
  startHole: number;
  endHole: number;
  players: { name: string; holes: HoleData[] }[];
  showTotal?: boolean;
}) {
  const indices = Array.from({ length: endHole - startHole }, (_, i) => startHole + i);

  return (
    <>
      {/* Header row: Hole numbers */}
      <thead>
        <tr className="bg-forest text-sm text-cornsilk/60">
          <th className="sticky left-0 z-10 min-w-[52px] bg-forest px-2 py-2 text-left font-semibold">Hole</th>
          {indices.map((i) => (
            <th key={i} className="min-w-[36px] px-1 py-2 font-semibold">{i + 1}</th>
          ))}
          <th className="min-w-[44px] border-l-2 border-olive/50 bg-forest px-2 py-2 font-bold">{label}</th>
          {showTotal && (
            <th className="min-w-[44px] border-l-2 border-olive/50 bg-forest px-2 py-2 font-bold">TOT</th>
          )}
        </tr>

        {/* Par row */}
        <tr className="border-b border-olive/30 bg-forest/80 text-sm text-cornsilk/50">
          <td className="sticky left-0 z-10 bg-forest/80 px-2 py-1.5 text-left font-semibold">Par</td>
          {indices.map((i) => (
            <td key={i} className="px-1 py-1.5 font-medium">{players[0]!.holes[i]?.par ?? 4}</td>
          ))}
          <td className="border-l-2 border-olive/50 bg-forest px-2 py-1.5 font-bold">
            {indices.reduce((s, i) => s + (players[0]!.holes[i]?.par ?? 4), 0)}
          </td>
          {showTotal && (
            <td className="border-l-2 border-olive/50 bg-forest px-2 py-1.5 font-bold">
              {players[0]!.holes.reduce((s, h) => s + h.par, 0)}
            </td>
          )}
        </tr>
      </thead>

      <tbody>
        {players.map((player, pi) => {
          const halfScore = indices.reduce((s, i) => s + (player.holes[i]?.score ?? 0), 0);
          const totalScore = player.holes.reduce((s, h) => s + h.score, 0);
          const halfPutts = indices.reduce((s, i) => s + (player.holes[i]?.putts ?? 0), 0);
          const totalPutts = player.holes.reduce((s, h) => s + h.putts, 0);
          const halfGirHit = indices.filter((i) => player.holes[i]?.gir === "hit").length;
          const totalGirHit = player.holes.filter((h) => h.gir === "hit").length;
          const halfFwHit = indices.filter((i) => {
            const h = player.holes[i];
            return h && h.par >= 4 && h.fairway === "hit";
          }).length;
          const halfFwTotal = indices.filter((i) => {
            const h = player.holes[i];
            return h && h.par >= 4 && h.fairway !== null;
          }).length;
          const bgClass = pi % 2 === 0 ? "bg-olive" : "bg-olive/70";

          return (
            <React.Fragment key={pi}>
              {/* Score row — player name */}
              <tr>
                <td
                  className={cn(
                    "sticky left-0 z-10 border-t border-olive/30 px-2 py-1.5 text-left text-sm font-semibold text-cornsilk",
                    bgClass
                  )}
                >
                  {player.name}
                </td>
                {indices.map((i) => {
                  const h = player.holes[i];
                  if (!h) return <td key={i} className={cn("border-t border-olive/30 px-1 py-1", bgClass)} />;
                  const diff = h.score - h.par;
                  const decoration = scoreDecoration(diff);
                  const color = scoreColor(diff);
                  return (
                    <td
                      key={i}
                      className={cn(
                        "border-t border-olive/30 px-1 py-1 text-sm tabular-nums",
                        bgClass
                      )}
                    >
                      <span className={cn(
                        "inline-flex h-6 w-6 items-center justify-center",
                        color,
                        decoration
                      )}>
                        {h.score}
                      </span>
                    </td>
                  );
                })}
                <td className="border-l-2 border-t border-olive/30 border-l-olive/50 bg-forest px-2 py-1 text-sm font-bold tabular-nums text-cornsilk">
                  {halfScore}
                </td>
                {showTotal && (
                  <td className="border-l-2 border-t border-olive/30 border-l-olive/50 bg-forest px-2 py-1 text-sm font-bold tabular-nums text-cornsilk">
                    {totalScore}
                  </td>
                )}
              </tr>

              {/* Putts sub-row */}
              <tr className={bgClass}>
                <td className={cn("sticky left-0 z-10 px-2 py-0.5 text-left text-[10px] font-medium uppercase tracking-wider text-cornsilk/40", bgClass)}>
                  Putts
                </td>
                {indices.map((i) => {
                  const h = player.holes[i];
                  return (
                    <td key={i} className="px-1 py-0.5 text-xs tabular-nums text-cornsilk/50">
                      {h?.putts ?? ""}
                    </td>
                  );
                })}
                <td className="border-l-2 border-l-olive/50 bg-forest px-2 py-0.5 text-xs tabular-nums text-cornsilk/60">
                  {halfPutts}
                </td>
                {showTotal && (
                  <td className="border-l-2 border-l-olive/50 bg-forest px-2 py-0.5 text-xs tabular-nums text-cornsilk/60">
                    {totalPutts}
                  </td>
                )}
              </tr>

              {/* GIR sub-row */}
              <tr className={bgClass}>
                <td className={cn("sticky left-0 z-10 px-2 py-0.5 text-left text-[10px] font-medium uppercase tracking-wider text-cornsilk/40", bgClass)}>
                  GIR
                </td>
                {indices.map((i) => {
                  const h = player.holes[i];
                  if (!h) return <td key={i} />;
                  const sym = girSymbol(h.gir);
                  return (
                    <td key={i} className={cn("px-1 py-0.5 text-xs", sym.color)}>
                      {sym.text}
                    </td>
                  );
                })}
                <td className="border-l-2 border-l-olive/50 bg-forest px-2 py-0.5 text-xs text-cornsilk/60">
                  {halfGirHit}/{indices.length}
                </td>
                {showTotal && (
                  <td className="border-l-2 border-l-olive/50 bg-forest px-2 py-0.5 text-xs text-cornsilk/60">
                    {totalGirHit}/{player.holes.length}
                  </td>
                )}
              </tr>

              {/* FW sub-row */}
              <tr className={cn("border-b border-olive/30", bgClass)}>
                <td className={cn("sticky left-0 z-10 px-2 py-0.5 text-left text-[10px] font-medium uppercase tracking-wider text-cornsilk/40", bgClass)}>
                  FW
                </td>
                {indices.map((i) => {
                  const h = player.holes[i];
                  if (!h) return <td key={i} />;
                  const sym = fwSymbol(h.fairway, h.par);
                  return (
                    <td key={i} className={cn("px-1 py-0.5 text-xs", sym.color)}>
                      {sym.text}
                    </td>
                  );
                })}
                <td className="border-l-2 border-l-olive/50 bg-forest px-2 py-0.5 text-xs text-cornsilk/60">
                  {halfFwHit}/{halfFwTotal}
                </td>
                {showTotal && (
                  <td className="border-l-2 border-l-olive/50 bg-forest px-2 py-0.5 text-xs text-cornsilk/60">
                    {player.holes.filter(h => h.par >= 4 && h.fairway === "hit").length}/
                    {player.holes.filter(h => h.par >= 4 && h.fairway !== null).length}
                  </td>
                )}
              </tr>
            </React.Fragment>
          );
        })}
      </tbody>
    </>
  );
}
