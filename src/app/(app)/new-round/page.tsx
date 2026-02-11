"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const defaultPars = [4, 4, 3, 4, 5, 4, 4, 3, 4, 4, 4, 3, 4, 5, 4, 4, 3, 4];

export default function NewRoundPage() {
  const [courseName, setCourseName] = useState("");
  const [slope, setSlope] = useState("");
  const [rating, setRating] = useState("");
  const [players, setPlayers] = useState([{ name: "Me" }]);
  const [holeCount, setHoleCount] = useState<9 | 18>(18);
  const [pars, setPars] = useState<number[]>(defaultPars);
  const [parPreset, setParPreset] = useState<number>(72);
  const router = useRouter();

  function addPlayer() {
    if (players.length < 4) {
      setPlayers([...players, { name: "" }]);
    }
  }

  function removePlayer(index: number) {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  }

  function updatePlayerName(index: number, name: string) {
    const updated = [...players];
    updated[index] = { name };
    setPlayers(updated);
  }

  function cyclePar(index: number) {
    const updated = [...pars];
    updated[index] = updated[index] === 3 ? 4 : updated[index] === 4 ? 5 : 3;
    setPars(updated);
  }

  function applyParPreset(total: number) {
    setParPreset(total);
    // Simple distribution: all par 4s, then adjust
    const newPars = Array(18).fill(4);
    if (total <= 70) {
      // 4 par 3s, 2 par 5s = 70
      [2, 7, 11, 16].forEach((i) => (newPars[i] = 3));
      [4, 13].forEach((i) => (newPars[i] = 5));
    } else if (total === 71) {
      // 3 par 3s, 4 par 5s = 71
      [2, 7, 16].forEach((i) => (newPars[i] = 3));
      [4, 8, 13, 17].forEach((i) => (newPars[i] = 5));
    } else {
      // 4 par 3s, 4 par 5s = 72
      [2, 7, 11, 16].forEach((i) => (newPars[i] = 3));
      [4, 8, 13, 17].forEach((i) => (newPars[i] = 5));
    }
    setPars(newPars);
  }

  const displayedPars = pars.slice(0, holeCount);
  const totalPar = displayedPars.reduce((s, p) => s + p, 0);
  const hasValidPlayer = players.some((p) => p.name.trim().length > 0);

  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="mx-auto w-full max-w-[560px]">
        {/* Back + title */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/rounds"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-clay transition-colors hover:bg-olive/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-cornsilk">New Round</h1>
        </div>

        <div className="flex flex-col gap-4">
          {/* Course Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-cornsilk/60">
              Course Name
            </label>
            <input
              type="text"
              placeholder="Course name (optional)"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="rounded-lg border border-olive bg-forest px-4 py-3 text-base text-cornsilk placeholder:text-cornsilk/30 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30"
            />
          </div>

          {/* Slope + Rating */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-cornsilk/60">
                Slope
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Slope"
                value={slope}
                onChange={(e) => setSlope(e.target.value)}
                className="rounded-lg border border-olive bg-forest px-4 py-3 text-base text-cornsilk placeholder:text-cornsilk/30 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-cornsilk/60">
                Course Rating
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="rounded-lg border border-olive bg-forest px-4 py-3 text-base text-cornsilk placeholder:text-cornsilk/30 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30"
              />
            </div>
          </div>

          {/* Players */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-cornsilk/60">
              Players
            </label>
            <div className="rounded-lg border border-olive bg-forest">
              {players.map((player, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5",
                    i > 0 && "border-t border-olive/30"
                  )}
                >
                  <input
                    type="text"
                    placeholder={`Player ${i + 1}`}
                    value={player.name}
                    onChange={(e) => updatePlayerName(i, e.target.value)}
                    className="flex-1 bg-transparent text-base text-cornsilk placeholder:text-cornsilk/30 focus:outline-none"
                    autoFocus={i === players.length - 1 && i > 0}
                  />
                  {players.length > 1 && (
                    <button
                      onClick={() => removePlayer(i)}
                      className="flex h-7 w-7 items-center justify-center rounded text-cornsilk/30 transition-colors hover:bg-olive/50 hover:text-cornsilk/60"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {players.length < 4 && (
                <button
                  onClick={addPlayer}
                  className="flex w-full items-center gap-2 border-t border-olive/30 px-4 py-2.5 text-sm font-medium text-clay transition-colors hover:bg-olive/20"
                >
                  <Plus className="h-4 w-4" />
                  Add Player
                </button>
              )}
            </div>
          </div>

          {/* Holes Toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-cornsilk/60">
              Holes
            </label>
            <div className="flex rounded-lg bg-olive p-1">
              {([9, 18] as const).map((count) => (
                <button
                  key={count}
                  onClick={() => setHoleCount(count)}
                  className={cn(
                    "flex-1 rounded-md py-2.5 text-sm font-medium transition-all duration-150",
                    holeCount === count
                      ? "bg-clay font-semibold text-forest"
                      : "text-cornsilk/60 hover:text-cornsilk/80"
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Pars */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-cornsilk/60">
              Pars
            </label>
            {/* Quick-set pills */}
            <div className="flex gap-2">
              {[70, 71, 72].map((total) => (
                <button
                  key={total}
                  onClick={() => applyParPreset(total)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150",
                    parPreset === total
                      ? "bg-clay font-semibold text-forest"
                      : "bg-olive text-cornsilk/60 hover:text-cornsilk/80"
                  )}
                >
                  {total}
                </button>
              ))}
              <span className="flex items-center text-xs text-cornsilk/30">
                Total: {totalPar}
              </span>
            </div>
            {/* Hole-by-hole grid */}
            <div className="grid grid-cols-9 gap-1">
              {displayedPars.map((par, i) => (
                <button
                  key={i}
                  onClick={() => cyclePar(i)}
                  className="flex flex-col items-center rounded-md bg-olive py-1.5 text-center transition-colors active:bg-clay/20"
                >
                  <span className="text-[10px] text-cornsilk/30">{i + 1}</span>
                  <span className="text-sm font-semibold text-cornsilk">
                    {par}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* GO Button */}
          <Button
            variant="primary"
            size="lg"
            className="mt-4 w-full text-lg font-bold"
            disabled={!hasValidPlayer}
            onClick={() => router.push("/round/active-1")}
          >
            GO
          </Button>
        </div>
      </div>
    </div>
  );
}
