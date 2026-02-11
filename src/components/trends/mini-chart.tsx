"use client";

import { cn } from "@/lib/utils";

interface MiniChartProps {
  data: number[];
  labels: string[];
  title: string;
  unit?: string;
  formatValue?: (v: number) => string;
  invertBetter?: boolean; // lower is better (e.g., score)
}

export function MiniChart({
  data,
  labels,
  title,
  unit,
  formatValue = (v) => String(v),
  invertBetter = false,
}: MiniChartProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const latest = data[data.length - 1];
  const prev = data.length > 1 ? data[data.length - 2] : latest;
  const diff = latest - prev;
  const improving = invertBetter ? diff < 0 : diff > 0;
  const steady = diff === 0;

  // SVG chart dimensions
  const chartW = 280;
  const chartH = 80;
  const padX = 4;
  const padY = 8;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2;

  const points = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * innerW;
    const y = padY + (1 - (v - min) / range) * innerH;
    return { x, y, v };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="rounded-xl border border-olive/50 bg-olive p-4">
      {/* Header */}
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wider text-cornsilk/50">
          {title}
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold tabular-nums text-cornsilk">
            {formatValue(latest)}
          </span>
          {unit && (
            <span className="text-xs text-cornsilk/40">{unit}</span>
          )}
          {!steady && (
            <span
              className={cn(
                "text-xs font-semibold tabular-nums",
                improving ? "text-clay" : "text-cornsilk/40"
              )}
            >
              {diff > 0 ? "+" : ""}
              {formatValue(diff)}
            </span>
          )}
        </div>
      </div>

      {/* SVG line chart */}
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={frac}
            x1={padX}
            y1={padY + frac * innerH}
            x2={chartW - padX}
            y2={padY + frac * innerH}
            stroke="currentColor"
            className="text-olive/30"
            strokeWidth="0.5"
            strokeDasharray="4 3"
          />
        ))}

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#DDA15E"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 4 : 3}
            fill="#DDA15E"
            stroke={i === points.length - 1 ? "#FEFAE0" : "none"}
            strokeWidth={i === points.length - 1 ? 1.5 : 0}
          />
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="mt-1.5 flex justify-between">
        {labels.map((label, i) => (
          <span key={i} className="text-[9px] text-cornsilk/30">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
