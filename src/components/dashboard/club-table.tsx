import type { ClubStat } from "@/lib/mock-data";

export function ClubTable({ clubs }: { clubs: ClubStat[] }) {
  if (clubs.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-olive/50 bg-olive">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-olive/30 text-xs text-cornsilk/50">
            <th className="px-4 py-2.5 text-left font-medium">Club</th>
            <th className="px-4 py-2.5 text-center font-medium">App</th>
            <th className="px-4 py-2.5 text-center font-medium">GIR</th>
            <th className="px-4 py-2.5 text-center font-medium">GIR%</th>
            <th className="px-4 py-2.5 text-center font-medium">Miss</th>
          </tr>
        </thead>
        <tbody>
          {clubs.map((club) => (
            <tr key={club.club} className="border-b border-olive/20 last:border-0">
              <td className="px-4 py-2.5 font-semibold text-cornsilk">{club.club}</td>
              <td className="px-4 py-2.5 text-center tabular-nums text-cornsilk/70">{club.approaches}</td>
              <td className="px-4 py-2.5 text-center tabular-nums text-cornsilk/70">{club.girHit}</td>
              <td className="px-4 py-2.5 text-center tabular-nums text-cornsilk/70">{club.girPercent}%</td>
              <td className="px-4 py-2.5 text-center text-cornsilk/50">{club.avgMiss}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
