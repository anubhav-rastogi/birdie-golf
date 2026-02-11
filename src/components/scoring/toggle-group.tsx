"use client";

import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

interface ToggleGroupProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}

export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: ToggleGroupProps<T>) {
  return (
    <div className="flex rounded-lg bg-olive p-1" role="radiogroup">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => {
              haptic();
              onChange(opt.value);
            }}
            role="radio"
            aria-checked={isSelected}
            className={cn(
              "focus-ring flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-150",
              isSelected
                ? "bg-clay font-semibold text-forest shadow-sm"
                : "text-cornsilk/60 hover:text-cornsilk/80"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
