"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { hapticHeavy } from "@/lib/haptics";
import type { HoleData } from "@/lib/mock-data";
import { getRoundStats } from "@/lib/mock-data";

interface FinishRoundDialogProps {
  holes: HoleData[];
  onCancel: () => void;
  onFinish: () => void;
}

function formatVsPar(vsPar: number): string {
  if (vsPar === 0) return "E";
  return vsPar > 0 ? `+${vsPar}` : `${vsPar}`;
}

export function FinishRoundDialog({ holes, onCancel, onFinish }: FinishRoundDialogProps) {
  const stats = getRoundStats(holes);
  const holesWithoutScore = holes.filter((h) => h.score === 0).length;

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  function handleFinish() {
    hapticHeavy();
    onFinish();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-forest/80 animate-backdrop"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm animate-slide-up rounded-xl border border-olive/50 bg-forest p-6 shadow-md">
        <h2 className="text-center text-xl font-bold text-cornsilk">
          Finish this round?
        </h2>

        {/* Summary */}
        <p className="mt-3 text-center text-sm text-cornsilk/60">
          {stats.totalScore} ({formatVsPar(stats.vsPar)}) &middot;{" "}
          {stats.girCount}/{stats.girTotal} GIR &middot;{" "}
          {stats.totalPutts} putts
        </p>

        {/* Incomplete warning */}
        {holesWithoutScore > 3 && (
          <div className="mt-3 rounded-lg bg-clay/10 px-3 py-2 text-center text-xs text-clay">
            ⚠ {holesWithoutScore} holes have no score entered.
            <br />
            You can always edit later.
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleFinish}
            className="flex-1"
          >
            Finish Round
          </Button>
        </div>
      </div>
    </div>
  );
}
