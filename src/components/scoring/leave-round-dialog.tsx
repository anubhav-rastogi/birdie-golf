"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LeaveRoundDialogProps {
  onStay: () => void;
  onLeave: () => void;
}

export function LeaveRoundDialog({ onStay, onLeave }: LeaveRoundDialogProps) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onStay();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStay]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-forest/80 animate-backdrop"
        onClick={onStay}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm animate-slide-up rounded-xl border border-olive/50 bg-forest p-6 shadow-md">
        <h2 className="text-center text-lg font-bold text-cornsilk">
          Leave this round?
        </h2>
        <p className="mt-2 text-center text-sm text-cornsilk/60">
          Your progress is saved. You can continue from the home screen.
        </p>

        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            onClick={onStay}
            className="flex-1"
          >
            Stay
          </Button>
          <Button
            variant="ghost"
            onClick={onLeave}
            className="flex-1"
          >
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
}
