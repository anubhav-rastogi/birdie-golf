import { cn } from "@/lib/utils";

interface StatSummaryProps {
  stats: {
    label: string;
    value: string;
    detail?: string;
    trend?: "up" | "down" | "steady";
    trendIsGood?: boolean;
  }[];
}

export function StatSummary({ stats }: StatSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-olive/50 bg-olive p-4"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-cornsilk/50">
            {stat.label}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-cornsilk">
              {stat.value}
            </span>
            {stat.trend && stat.trend !== "steady" && (
              <span
                className={cn(
                  "text-xs font-semibold",
                  stat.trendIsGood ? "text-clay" : "text-cornsilk/40"
                )}
              >
                {stat.trend === "up" ? "↑" : "↓"}
              </span>
            )}
          </div>
          {stat.detail && (
            <p className="mt-0.5 text-xs text-cornsilk/40">{stat.detail}</p>
          )}
        </div>
      ))}
    </div>
  );
}
