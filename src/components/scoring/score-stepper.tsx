"use client";

import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

interface ScoreStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  sublabel?: string;
  size?: "hero" | "compact";
}

export function ScoreStepper({
  value,
  onChange,
  min = 1,
  max = 15,
  label,
  sublabel,
  size = "hero",
}: ScoreStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;
  const isHero = size === "hero";
  const [pulse, setPulse] = useState(false);

  // Trigger pulse animation on value change
  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 120);
    return () => clearTimeout(t);
  }, [value]);

  function decrement() {
    if (atMin) return;
    haptic();
    onChange(value - 1);
  }

  function increment() {
    if (atMax) return;
    haptic();
    onChange(value + 1);
  }

  return (
    <div className="rounded-xl bg-olive p-3">
      <div className="flex items-center justify-between">
        <button
          onClick={decrement}
          className={cn(
            "focus-ring flex items-center justify-center rounded-full transition-all duration-150 active:scale-95",
            isHero ? "h-14 w-14" : "h-10 w-10",
            atMin
              ? "bg-clay/30 text-forest/50 cursor-not-allowed"
              : "bg-clay text-forest hover:bg-copper"
          )}
          disabled={atMin}
          aria-label={`Decrease ${label}`}
        >
          <Minus className={isHero ? "h-6 w-6" : "h-4 w-4"} strokeWidth={2.5} />
        </button>

        <div className="flex flex-col items-center">
          <span
            className={cn(
              "font-extrabold tabular-nums text-cornsilk leading-none transition-transform duration-100",
              isHero ? "text-7xl" : "text-xl",
              pulse && "animate-score-pulse"
            )}
            role="spinbutton"
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-label={label}
          >
            {value}
          </span>
          {sublabel && (
            <span className="mt-1 text-xs font-medium text-cornsilk/50">
              {sublabel}
            </span>
          )}
        </div>

        <button
          onClick={increment}
          className={cn(
            "focus-ring flex items-center justify-center rounded-full transition-all duration-150 active:scale-95",
            isHero ? "h-14 w-14" : "h-10 w-10",
            atMax
              ? "bg-clay/30 text-forest/50 cursor-not-allowed"
              : "bg-clay text-forest hover:bg-copper"
          )}
          disabled={atMax}
          aria-label={`Increase ${label}`}
        >
          <Plus className={isHero ? "h-6 w-6" : "h-4 w-4"} strokeWidth={2.5} />
        </button>
      </div>
      <p className="mt-1 text-center text-xs font-medium uppercase tracking-wider text-cornsilk/50">
        {label}
      </p>
    </div>
  );
}
