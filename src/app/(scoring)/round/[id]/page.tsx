"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMockRound, getRoundStats } from "@/lib/mock-data";
import type { Fairway, GIR, PinPosition, MissDirection, HoleData } from "@/lib/mock-data";
import { ScoreStepper } from "@/components/scoring/score-stepper";
import { ToggleGroup } from "@/components/scoring/toggle-group";
import { MissDiamond } from "@/components/scoring/miss-diamond";
import { ClubSelector } from "@/components/scoring/club-selector";
import { RunningTotals } from "@/components/scoring/running-totals";
import { HolePicker } from "@/components/scoring/hole-picker";
import { FinishRoundDialog } from "@/components/scoring/finish-round-dialog";
import { haptic } from "@/lib/haptics";

const fairwayOptions = [
  { value: "left" as const, label: "← LEFT" },
  { value: "hit" as const, label: "HIT" },
  { value: "right" as const, label: "RIGHT →" },
];

const girOptions = [
  { value: "hit" as const, label: "HIT" },
  { value: "miss" as const, label: "MISS" },
];

const pinOptions = [
  { value: "front" as const, label: "FRONT" },
  { value: "center" as const, label: "CENTER" },
  { value: "back" as const, label: "BACK" },
];

function getScoreLabel(score: number, par: number): { text: string; color: string } {
  const diff = score - par;
  if (diff <= -2) return { text: "EAGLE", color: "text-copper" };
  if (diff === -1) return { text: "BIRDIE", color: "text-clay" };
  if (diff === 0) return { text: "PAR", color: "text-cornsilk" };
  if (diff === 1) return { text: "BOGEY", color: "text-cornsilk/60" };
  if (diff === 2) return { text: "DOUBLE", color: "text-cornsilk/40" };
  return { text: `+${diff}`, color: "text-cornsilk/40" };
}

export default function ScoreEntryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const round = getMockRound(params.id);
  const totalHoles = round.holeCount;
  const pars = round.players[0]!.holes.map((h) => h.par);

  const allPars = useMemo(() => {
    const p = [...pars];
    while (p.length < totalHoles) p.push(4);
    return p;
  }, [pars, totalHoles]);

  const [currentHole, setCurrentHole] = useState(0);
  const [activePlayer, setActivePlayer] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [showHolePicker, setShowHolePicker] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);

  const [holesData, setHolesData] = useState<HoleData[][]>(() =>
    round.players.map((player) => {
      const holes = [...player.holes];
      while (holes.length < totalHoles) {
        holes.push({
          holeNumber: holes.length + 1,
          par: allPars[holes.length] ?? 4,
          score: allPars[holes.length] ?? 4,
          putts: 2,
          fairway: null,
          gir: "hit",
          girMissDirection: [],
          pinPosition: "center",
          penalties: 0,
          club: null,
          upAndDown: null,
          sandSave: null,
          notes: "",
        });
      }
      return holes;
    })
  );

  const hole = holesData[activePlayer]![currentHole]!;
  const par = allPars[currentHole]!;
  const scoreLabel = getScoreLabel(hole.score, par);

  function updateHole(updates: Partial<HoleData>) {
    setHolesData((prev) => {
      const copy = prev.map((p) => [...p]);
      copy[activePlayer]![currentHole] = { ...copy[activePlayer]![currentHole]!, ...updates };
      return copy;
    });
  }

  function updateScore(score: number) {
    const gir: GIR = score - hole.putts <= par - 2 ? "hit" : "miss";
    updateHole({ score, gir, girMissDirection: gir === "hit" ? [] : hole.girMissDirection });
  }

  function updatePutts(putts: number) {
    const gir: GIR = hole.score - putts <= par - 2 ? "hit" : "miss";
    updateHole({ putts, gir, girMissDirection: gir === "hit" ? [] : hole.girMissDirection });
  }

  const goToHole = useCallback(
    (h: number) => {
      if (h < 0 || h >= totalHoles) return;
      setSlideDir(h > currentHole ? "left" : "right");
      haptic();
      setCurrentHole(h);
      // Reset animation
      setTimeout(() => setSlideDir(null), 260);
    },
    [currentHole, totalHoles]
  );

  const goNext = useCallback(() => {
    if (currentHole >= totalHoles - 1) {
      setShowFinish(true);
      return;
    }
    goToHole(currentHole + 1);
  }, [currentHole, totalHoles, goToHole]);

  const goPrev = useCallback(() => {
    goToHole(currentHole - 1);
  }, [currentHole, goToHole]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case "ArrowUp":
          e.preventDefault();
          updateScore(Math.min(hole.score + 1, 15));
          break;
        case "ArrowDown":
          e.preventDefault();
          updateScore(Math.max(hole.score - 1, 1));
          break;
        case "g":
        case "G":
          e.preventDefault();
          updateHole({ gir: hole.gir === "hit" ? "miss" : "hit" });
          break;
        default:
          // Number keys for hole jump
          if (e.key >= "1" && e.key <= "9") {
            const num = e.shiftKey ? parseInt(e.key) + 9 : parseInt(e.key);
            if (num <= totalHoles) {
              e.preventDefault();
              goToHole(num - 1);
            }
          }
          if (e.key === "0" && totalHoles >= 10) {
            e.preventDefault();
            goToHole(9); // Hole 10
          }
          break;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, hole.score, hole.gir, totalHoles, goToHole]);

  const playedHoles = holesData[activePlayer]!.filter((h) => h.score > 0);
  const multiPlayer = round.players.length > 1;

  return (
    <div className="flex flex-1 flex-col">
      {/* Player selector (multiplayer only) */}
      {multiPlayer && (
        <div className="flex h-10 items-center gap-1 border-b border-olive/30 bg-forest px-4">
          {round.players.map((player, i) => (
            <button
              key={i}
              onClick={() => setActivePlayer(i)}
              className={cn(
                "focus-ring px-3 py-1.5 text-sm font-medium transition-colors",
                i === activePlayer
                  ? "border-b-2 border-clay text-clay"
                  : "text-cornsilk/50 hover:text-cornsilk/80"
              )}
            >
              {player.name}
            </button>
          ))}
        </div>
      )}

      {/* Running totals */}
      <RunningTotals holes={playedHoles} />

      {/* Hole card */}
      <div className="flex-1 px-4 py-4">
        <div className="mx-auto w-full max-w-[480px]">
          <div
            className={cn(
              "rounded-xl border border-olive/50 bg-olive p-3 transition-all duration-250",
              slideDir === "left" && "animate-slide-in",
              slideDir === "right" && "animate-slide-in"
            )}
            key={`hole-${currentHole}`}
          >
            {/* Hole header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHolePicker(true)}
                  className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-clay text-sm font-bold text-forest transition-transform hover:scale-110"
                  aria-label="Open hole picker"
                >
                  {currentHole + 1}
                </button>
                <span className="text-xs text-cornsilk/60">Par {par}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-cornsilk/60">
                  {currentHole + 1}/{totalHoles}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Score stepper */}
              <div>
                <ScoreStepper
                  value={hole.score}
                  onChange={updateScore}
                  min={1}
                  max={15}
                  label={scoreLabel.text}
                  sublabel={`PAR ${par}`}
                  size="hero"
                />
                <p className={cn("mt-1 text-center text-xs font-medium", scoreLabel.color)}>
                  {scoreLabel.text}
                </p>
              </div>

              {/* Putts stepper */}
              <ScoreStepper
                value={hole.putts}
                onChange={updatePutts}
                min={0}
                max={6}
                label="PUTTS"
                size="compact"
              />

              {/* Fairway toggle (hidden on par 3) */}
              {par >= 4 && (
                <ToggleGroup
                  options={fairwayOptions}
                  value={hole.fairway}
                  onChange={(v) => updateHole({ fairway: v as Fairway })}
                />
              )}

              {/* GIR toggle */}
              <ToggleGroup
                options={girOptions}
                value={hole.gir}
                onChange={(v) => {
                  const gir = v as GIR;
                  updateHole({
                    gir,
                    girMissDirection: gir === "hit" ? [] : hole.girMissDirection,
                  });
                }}
              />

              {/* Miss direction diamond (animated expand) */}
              {hole.gir === "miss" && (
                <div className="animate-expand py-2">
                  <MissDiamond
                    selected={hole.girMissDirection}
                    onChange={(dirs) => updateHole({ girMissDirection: dirs })}
                  />
                </div>
              )}

              {/* Pin position */}
              <ToggleGroup
                options={pinOptions}
                value={hole.pinPosition}
                onChange={(v) => updateHole({ pinPosition: v as PinPosition })}
              />

              {/* More details expander */}
              <button
                onClick={() => setShowMore(!showMore)}
                className="focus-ring flex items-center justify-center gap-1 py-1 text-sm font-medium text-clay transition-colors hover:text-copper"
              >
                More details
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    showMore && "rotate-180"
                  )}
                />
              </button>

              {/* Secondary fields (animated expand) */}
              {showMore && (
                <div className="animate-expand flex flex-col gap-3 border-t border-olive/30 pt-3">
                  {/* Penalties */}
                  <ScoreStepper
                    value={hole.penalties}
                    onChange={(v) => updateHole({ penalties: v })}
                    min={0}
                    max={10}
                    label="PENALTIES"
                    size="compact"
                  />

                  {/* Club selector */}
                  <div>
                    <p className="mb-1 text-xs font-medium text-cornsilk/50">CLUB INTO GREEN</p>
                    <ClubSelector
                      value={hole.club}
                      onChange={(club) => updateHole({ club })}
                    />
                  </div>

                  {/* Up and down (only when GIR = miss) */}
                  {hole.gir === "miss" && (
                    <ToggleGroup
                      options={[
                        { value: "yes", label: "UP & DOWN: YES" },
                        { value: "no", label: "NO" },
                      ]}
                      value={hole.upAndDown === true ? "yes" : hole.upAndDown === false ? "no" : null}
                      onChange={(v) => updateHole({ upAndDown: v === "yes" })}
                    />
                  )}

                  {/* Sand save (only when GIR = miss) */}
                  {hole.gir === "miss" && (
                    <ToggleGroup
                      options={[
                        { value: "yes", label: "SAND SAVE: YES" },
                        { value: "no", label: "NO" },
                      ]}
                      value={hole.sandSave === true ? "yes" : hole.sandSave === false ? "no" : null}
                      onChange={(v) => updateHole({ sandSave: v === "yes" })}
                    />
                  )}

                  {/* Notes */}
                  <input
                    type="text"
                    placeholder="Wind, lie, mental note..."
                    value={hole.notes}
                    onChange={(e) => updateHole({ notes: e.target.value.slice(0, 200) })}
                    maxLength={200}
                    className="rounded-lg border border-olive/50 bg-forest px-4 py-3 text-sm text-cornsilk placeholder:text-cornsilk/30 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Hole navigation */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentHole === 0}
              className={cn(
                "focus-ring flex h-12 items-center gap-1 rounded-lg px-4 text-sm font-medium transition-colors",
                currentHole === 0
                  ? "text-cornsilk/20 cursor-not-allowed"
                  : "text-clay hover:bg-olive/50"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            {/* Hole picker dots */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalHoles, 18) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => goToHole(i)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-150",
                    i === currentHole
                      ? "bg-clay scale-125"
                      : i < playedHoles.length
                        ? "bg-olive hover:bg-cornsilk/40"
                        : "bg-olive/50"
                  )}
                  aria-label={`Go to hole ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className={cn(
                "focus-ring flex h-12 items-center gap-1 rounded-lg px-4 text-sm font-medium transition-colors",
                currentHole >= totalHoles - 1
                  ? "text-clay font-bold"
                  : "text-clay hover:bg-olive/50"
              )}
            >
              {currentHole >= totalHoles - 1 ? "Finish" : "Next"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Keyboard hint (desktop) */}
          <div className="mt-4 hidden justify-center gap-4 text-[10px] text-cornsilk/20 lg:flex">
            <span>←→ holes</span>
            <span>↑↓ score</span>
            <span>G toggle GIR</span>
            <span>1-9 jump</span>
          </div>
        </div>
      </div>

      {/* Hole picker bottom sheet */}
      {showHolePicker && (
        <HolePicker
          totalHoles={totalHoles}
          currentHole={currentHole}
          playedCount={playedHoles.length}
          onSelect={(h) => goToHole(h)}
          onClose={() => setShowHolePicker(false)}
        />
      )}

      {/* Finish round dialog */}
      {showFinish && (
        <FinishRoundDialog
          holes={holesData[activePlayer]!}
          onCancel={() => setShowFinish(false)}
          onFinish={() => {
            router.push(`/rounds/${params.id}`);
          }}
        />
      )}
    </div>
  );
}
