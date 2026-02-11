"use client";

import { cn } from "@/lib/utils";
import type { HoleData, MissDirection } from "@/lib/mock-data";

interface MissMapProps {
  holes: HoleData[];
  className?: string;
}

/** Convert miss directions into an x/y offset from center. */
function getMissOffset(directions: MissDirection[]): { x: number; y: number } {
  let x = 0, y = 0;
  for (const d of directions) {
    if (d === "short") y += 1;
    if (d === "long") y -= 1;
    if (d === "left") x -= 1;
    if (d === "right") x += 1;
  }
  const len = Math.sqrt(x * x + y * y) || 1;
  return { x: (x / len) * 60, y: (y / len) * 55 };
}

/** Deterministic pseudo-random jitter so dots don't overlap exactly. */
function jitter(seed: number, range: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * range * 2 - range;
}

export function MissMap({ holes, className }: MissMapProps) {
  const misses = holes.filter((h) => h.gir === "miss" && h.girMissDirection.length > 0);

  if (misses.length === 0) {
    return (
      <div className={cn("rounded-xl border border-olive/50 bg-olive p-6 text-center", className)}>
        <p className="text-lg font-semibold text-clay">All greens in regulation!</p>
        <p className="mt-1 text-sm text-cornsilk/60">No miss pattern to show.</p>
      </div>
    );
  }

  const cx = 160, cy = 140;
  const w = 320, h = 310;

  return (
    <div className={cn("rounded-xl border border-olive/50 bg-olive p-6", className)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto w-full max-w-[320px]" role="img" aria-label="Miss pattern relative to the pin">
        {/* Green oval */}
        <ellipse cx={cx} cy={cy} rx={100} ry={85} fill="#4a5e2d" stroke="#FEFAE0" strokeWidth="1" strokeOpacity="0.15" />

        {/* Direction labels outside the green */}
        <text x={cx} y={24} textAnchor="middle" fill="#FEFAE0" fillOpacity="0.3" fontSize="10" fontWeight="500">LONG</text>
        <text x={cx} y={h - 6} textAnchor="middle" fill="#FEFAE0" fillOpacity="0.3" fontSize="10" fontWeight="500">SHORT</text>
        <text x={24} y={cy + 4} textAnchor="middle" fill="#FEFAE0" fillOpacity="0.3" fontSize="10" fontWeight="500">LEFT</text>
        <text x={w - 24} y={cy + 4} textAnchor="middle" fill="#FEFAE0" fillOpacity="0.3" fontSize="10" fontWeight="500">RIGHT</text>

        {/* Miss dots — each dot is one GIR miss, positioned by miss direction */}
        {misses.map((hole, i) => {
          const offset = getMissOffset(hole.girMissDirection);
          const dotX = cx + offset.x + jitter(hole.holeNumber, 8);
          const dotY = cy + offset.y + jitter(hole.holeNumber * 3, 8);
          return (
            <circle
              key={i}
              cx={dotX}
              cy={dotY}
              r={6}
              fill="#DDA15E"
              stroke="#283618"
              strokeWidth="1.5"
              className="animate-scale-in"
              style={{
                animationDelay: `${i * 50}ms`,
                transformOrigin: `${dotX}px ${dotY}px`,
              }}
            />
          );
        })}

        {/* Pin icon — always at center of the green */}
        {/* Flag pole */}
        <line x1={cx} y1={cy - 18} x2={cx} y2={cy + 4} stroke="#FEFAE0" strokeWidth="1.5" />
        {/* Flag triangle */}
        <polygon points={`${cx},${cy - 18} ${cx + 12},${cy - 13} ${cx},${cy - 8}`} fill="#BC6C25" />
        {/* Hole circle */}
        <circle cx={cx} cy={cy + 4} r={2.5} fill="#283618" stroke="#FEFAE0" strokeWidth="1" />
      </svg>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-clay" />
          <span className="text-xs text-cornsilk/50">Approach</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line x1="6" y1="1" x2="6" y2="9" stroke="#FEFAE0" strokeWidth="1" />
            <polygon points="6,1 11,4.5 6,6" fill="#BC6C25" />
            <circle cx="6" cy="9" r="1.5" fill="#283618" stroke="#FEFAE0" strokeWidth="0.5" />
          </svg>
          <span className="text-xs text-cornsilk/50">Pin</span>
        </div>
      </div>
    </div>
  );
}
