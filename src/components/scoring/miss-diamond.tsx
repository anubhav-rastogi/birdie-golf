"use client";

import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import type { MissDirection } from "@/lib/mock-data";

interface MissDiamondProps {
  selected: MissDirection[];
  onChange: (directions: MissDirection[]) => void;
}

const directions: { dir: MissDirection; label: string; row: number; col: number }[] = [
  { dir: "long",  label: "LONG",  row: 0, col: 1 },
  { dir: "left",  label: "LEFT",  row: 1, col: 0 },
  { dir: "right", label: "RIGHT", row: 1, col: 2 },
  { dir: "short", label: "SHORT", row: 2, col: 1 },
];

export function MissDiamond({ selected, onChange }: MissDiamondProps) {
  function toggle(dir: MissDirection) {
    haptic();
    if (selected.includes(dir)) {
      onChange(selected.filter((d) => d !== dir));
    } else {
      onChange([...selected, dir]);
    }
  }

  return (
    <div className="mx-auto grid w-[180px] grid-cols-3 grid-rows-3 gap-2">
      {directions.map(({ dir, label, row, col }) => {
        const isSelected = selected.includes(dir);
        return (
          <button
            key={dir}
            onClick={() => toggle(dir)}
            className={cn(
              "focus-ring flex h-12 w-12 items-center justify-center rounded-full border text-[10px] font-semibold transition-all duration-150",
              isSelected
                ? "border-clay bg-clay text-forest scale-105"
                : "border-olive/50 bg-olive text-cornsilk/60 hover:border-cornsilk/30"
            )}
            style={{
              gridRow: row + 1,
              gridColumn: col + 1,
            }}
            aria-label={`Miss ${label}`}
            aria-pressed={isSelected}
          >
            {label}
          </button>
        );
      })}
      {/* Center dot */}
      <div
        className="flex items-center justify-center"
        style={{ gridRow: 2, gridColumn: 2 }}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-cornsilk/30" />
      </div>
    </div>
  );
}
