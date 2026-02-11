"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface HolePickerProps {
  totalHoles: number;
  currentHole: number;
  playedCount: number;
  onSelect: (hole: number) => void;
  onClose: () => void;
}

export function HolePicker({
  totalHoles,
  currentHole,
  playedCount,
  onSelect,
  onClose,
}: HolePickerProps) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-forest/80 animate-backdrop"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="relative z-10 w-full max-w-md animate-slide-up rounded-t-2xl border-t border-olive/50 bg-forest p-6 pb-[calc(env(safe-area-inset-bottom,0px)+24px)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-cornsilk">Jump to Hole</h3>
          <button
            onClick={onClose}
            className="text-xs font-medium text-cornsilk/40 hover:text-cornsilk/60"
          >
            Close
          </button>
        </div>

        {/* Hole grid */}
        <div className="grid grid-cols-9 gap-2">
          {Array.from({ length: totalHoles }, (_, i) => {
            const isCurrent = i === currentHole;
            const hasData = i < playedCount;

            return (
              <button
                key={i}
                onClick={() => {
                  onSelect(i);
                  onClose();
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-150",
                  isCurrent
                    ? "bg-clay text-forest scale-110"
                    : hasData
                      ? "bg-olive text-cornsilk hover:bg-olive/80"
                      : "bg-olive/50 text-cornsilk/30 hover:bg-olive/70"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
