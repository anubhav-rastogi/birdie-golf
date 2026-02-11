"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoundCard } from "@/components/round-card";

export interface RoundSummary {
  id: string;
  courseName: string;
  date: string;
  score: number;
  vsPar: number;
  girPercent: number;
  fwPercent: number;
  putts: number;
  status: "completed" | "active";
  holeProgress?: string; // e.g. "7 of 18"
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-20 animate-fade-in">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-olive/50">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-cornsilk/40"
        >
          <path d="M4 22V4c0-1 1-2 2-2h2l7 4-7 4V4" />
          <circle cx="10" cy="22" r="5" fill="none" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-cornsilk/40">
          No rounds yet
        </h2>
        <p className="mt-1 text-sm text-cornsilk/30">
          Start tracking your game to see stats and trends.
        </p>
      </div>
      <Link href="/new-round">
        <Button variant="primary" size="lg" className="mt-2">
          <Plus className="h-5 w-5" />
          Start Your First Round
        </Button>
      </Link>
    </div>
  );
}

function ActiveRoundBanner({ round }: { round: RoundSummary }) {
  return (
    <Link
      href={`/round/${round.id}`}
      className="flex items-center gap-3 rounded-lg border border-clay/30 bg-clay/10 p-4 transition-all duration-150 hover:bg-clay/20 hover:scale-[1.01]"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clay/20">
        <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-clay" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-cornsilk">
          Round in progress
        </p>
        <p className="text-xs text-cornsilk/50">
          {round.courseName || "Round"} &middot; Hole {round.holeProgress}
        </p>
      </div>
      <span className="text-sm font-medium text-clay">Continue →</span>
    </Link>
  );
}

export function RoundList({
  rounds,
  selectedIndex = -1,
}: {
  rounds: RoundSummary[];
  selectedIndex?: number;
}) {
  if (rounds.length === 0) {
    return <EmptyState />;
  }

  const activeRound = rounds.find((r) => r.status === "active");
  const completedRounds = rounds.filter((r) => r.status === "completed");

  return (
    <div className="px-4 py-4 sm:px-6 animate-fade-in">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3">
        {/* Active round banner */}
        {activeRound && <ActiveRoundBanner round={activeRound} />}

        {/* Section header */}
        <div className="flex items-baseline justify-between pt-1">
          <h2 className="text-lg font-bold text-cornsilk">Round History</h2>
          <span className="text-xs text-cornsilk/40">
            {completedRounds.length} round{completedRounds.length !== 1 && "s"}
          </span>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="hidden items-center gap-3 text-[10px] text-cornsilk/20 lg:flex">
          <span>N new round</span>
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>⌘K search</span>
        </div>

        {/* Round cards */}
        <div className="flex flex-col gap-2">
          {completedRounds.map((round, i) => (
            <RoundCard
              key={round.id}
              round={round}
              isSelected={i === selectedIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
