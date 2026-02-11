"use client";

import { cn } from "@/lib/utils";

const clubs = ["W", "3W", "3i", "4i", "5i", "6i", "7i", "8i", "9i", "PW", "GW", "SW", "LW"];

interface ClubSelectorProps {
  value: string | null;
  onChange: (club: string | null) => void;
}

export function ClubSelector({ value, onChange }: ClubSelectorProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto py-1" style={{ scrollSnapType: "x mandatory" }}>
      {clubs.map((club) => {
        const isSelected = value === club;
        return (
          <button
            key={club}
            onClick={() => onChange(isSelected ? null : club)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150",
              isSelected
                ? "bg-clay font-semibold text-forest"
                : "bg-olive text-cornsilk/60 hover:text-cornsilk/80"
            )}
            style={{ scrollSnapAlign: "center" }}
          >
            {club}
          </button>
        );
      })}
    </div>
  );
}
