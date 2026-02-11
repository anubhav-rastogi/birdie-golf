import type { RoundSummary } from "@/components/round-list";

// ── Round summaries (for history list) ──

export const mockRounds: RoundSummary[] = [
  {
    id: "active-1",
    courseName: "Pebble Beach",
    date: "Feb 11, 2026",
    score: 38,
    vsPar: 2,
    girPercent: 56,
    fwPercent: 60,
    putts: 16,
    status: "active",
    holeProgress: "9 of 18",
  },
  { id: "1", courseName: "Pebble Beach", date: "Feb 9, 2026", score: 74, vsPar: 2, girPercent: 61, fwPercent: 64, putts: 30, status: "completed" },
  { id: "2", courseName: "Home Course", date: "Feb 5, 2026", score: 78, vsPar: 6, girPercent: 50, fwPercent: 57, putts: 33, status: "completed" },
  { id: "3", courseName: "Torrey Pines South", date: "Jan 28, 2026", score: 81, vsPar: 9, girPercent: 44, fwPercent: 50, putts: 34, status: "completed" },
  { id: "4", courseName: "Spyglass Hill", date: "Jan 20, 2026", score: 72, vsPar: 0, girPercent: 72, fwPercent: 71, putts: 28, status: "completed" },
  { id: "5", courseName: "Spanish Bay", date: "Jan 15, 2026", score: 76, vsPar: 4, girPercent: 56, fwPercent: 64, putts: 31, status: "completed" },
  { id: "6", courseName: "Pasatiempo", date: "Jan 8, 2026", score: 79, vsPar: 7, girPercent: 44, fwPercent: 50, putts: 32, status: "completed" },
  { id: "7", courseName: "Half Moon Bay (Old)", date: "Dec 30, 2025", score: 75, vsPar: 3, girPercent: 61, fwPercent: 71, putts: 29, status: "completed" },
];

// ── Detailed hole data ──

export type Fairway = "left" | "hit" | "right" | null;
export type GIR = "hit" | "miss";
export type PinPosition = "front" | "center" | "back";
export type MissDirection = "short" | "long" | "left" | "right";

export interface HoleData {
  holeNumber: number;
  par: number;
  score: number;
  putts: number;
  fairway: Fairway;
  gir: GIR;
  girMissDirection: MissDirection[];
  pinPosition: PinPosition;
  penalties: number;
  club: string | null;
  upAndDown: boolean | null;
  sandSave: boolean | null;
  notes: string;
}

export interface DetailedRound {
  id: string;
  courseName: string;
  date: string;
  slope: number | null;
  courseRating: number | null;
  holeCount: number;
  players: { name: string; holes: HoleData[] }[];
  status: "active" | "completed";
}

// Pebble Beach round (id: "1") — full 18 holes
const pebbleBeachHoles: HoleData[] = [
  { holeNumber: 1,  par: 4, score: 4, putts: 2, fairway: "hit",   gir: "hit",  girMissDirection: [],          pinPosition: "center", penalties: 0, club: "7i",  upAndDown: null,  sandSave: null,  notes: "" },
  { holeNumber: 2,  par: 4, score: 5, putts: 2, fairway: "left",  gir: "miss", girMissDirection: ["short"],    pinPosition: "back",   penalties: 0, club: "6i",  upAndDown: false, sandSave: null,  notes: "Pulled tee shot into left rough" },
  { holeNumber: 3,  par: 3, score: 3, putts: 2, fairway: null,    gir: "hit",  girMissDirection: [],           pinPosition: "front",  penalties: 0, club: "8i",  upAndDown: null,  sandSave: null,  notes: "" },
  { holeNumber: 4,  par: 4, score: 3, putts: 1, fairway: "hit",   gir: "hit",  girMissDirection: [],           pinPosition: "center", penalties: 0, club: "9i",  upAndDown: null,  sandSave: null,  notes: "15ft birdie putt" },
  { holeNumber: 5,  par: 5, score: 5, putts: 2, fairway: "hit",   gir: "hit",  girMissDirection: [],           pinPosition: "back",   penalties: 0, club: "5i",  upAndDown: null,  sandSave: null,  notes: "" },
  { holeNumber: 6,  par: 4, score: 4, putts: 2, fairway: "hit",   gir: "hit",  girMissDirection: [],           pinPosition: "center", penalties: 0, club: "8i",  upAndDown: null,  sandSave: null,  notes: "" },
  { holeNumber: 7,  par: 3, score: 4, putts: 2, fairway: null,    gir: "miss", girMissDirection: ["short", "right"], pinPosition: "back", penalties: 0, club: "7i", upAndDown: false, sandSave: null, notes: "Wind was 2 clubs" },
  { holeNumber: 8,  par: 4, score: 4, putts: 1, fairway: "right", gir: "miss", girMissDirection: ["right"],    pinPosition: "center", penalties: 0, club: "PW",  upAndDown: true,  sandSave: null,  notes: "" },
  { holeNumber: 9,  par: 4, score: 4, putts: 2, fairway: "hit",   gir: "hit",  girMissDirection: [],           pinPosition: "front",  penalties: 0, club: "9i",  upAndDown: null,  sandSave: null,  notes: "" },
  { holeNumber: 10, par: 4, score: 5, putts: 2, fairway: "left",  gir: "miss", girMissDirection: ["long"],     pinPosition: "front",  penalties: 0, club: "6i",  upAndDown: false, sandSave: null,  notes: "" },
  { holeNumber: 11, par: 4, score: 4, putts: 2, fairway: "hit",   gir: "hit",  girMissDirection: [],           pinPosition: "center", penalties: 0, club: "7i",  upAndDown: null,  sandSave: null,  notes: "" },
  { holeNumber: 12, par: 3, score: 3, putts: 1, fairway: null,    gir: "hit",  girMissDirection: [],           pinPosition: "back",   penalties: 0, club: "6i",  upAndDown: null,  sandSave: null,  notes: "Stuck it close" },
  { holeNumber: 13, par: 4, score: 4, putts: 2, fairway: "hit",   gir: "hit",  girMissDirection: [],           pinPosition: "center", penalties: 0, club: "8i",  upAndDown: null,  sandSave: null,  notes: "" },
  { holeNumber: 14, par: 5, score: 5, putts: 2, fairway: "hit",   gir: "hit",  girMissDirection: [],           pinPosition: "front",  penalties: 0, club: "4i",  upAndDown: null,  sandSave: null,  notes: "" },
  { holeNumber: 15, par: 4, score: 5, putts: 2, fairway: "hit",   gir: "miss", girMissDirection: ["short", "left"], pinPosition: "back", penalties: 0, club: "7i", upAndDown: false, sandSave: null, notes: "Under-clubbed into wind" },
  { holeNumber: 16, par: 3, score: 3, putts: 2, fairway: null,    gir: "hit",  girMissDirection: [],           pinPosition: "center", penalties: 0, club: "5i",  upAndDown: null,  sandSave: null,  notes: "" },
  { holeNumber: 17, par: 4, score: 4, putts: 1, fairway: "hit",   gir: "miss", girMissDirection: ["short"],    pinPosition: "front",  penalties: 0, club: "9i",  upAndDown: true,  sandSave: true,  notes: "Bunker save!" },
  { holeNumber: 18, par: 5, score: 4, putts: 1, fairway: "hit",   gir: "hit",  girMissDirection: [],           pinPosition: "back",   penalties: 0, club: "3W",  upAndDown: null,  sandSave: null,  notes: "Eagle putt just missed, tap-in birdie" },
];

// Active round — front 9 only
const activeRoundHoles: HoleData[] = [
  { holeNumber: 1,  par: 4, score: 4, putts: 2, fairway: "hit",   gir: "hit",  girMissDirection: [],           pinPosition: "center", penalties: 0, club: "7i",  upAndDown: null,  sandSave: null, notes: "" },
  { holeNumber: 2,  par: 4, score: 5, putts: 2, fairway: "right", gir: "miss", girMissDirection: ["right"],    pinPosition: "back",   penalties: 0, club: "6i",  upAndDown: false, sandSave: null, notes: "" },
  { holeNumber: 3,  par: 3, score: 3, putts: 1, fairway: null,    gir: "hit",  girMissDirection: [],           pinPosition: "front",  penalties: 0, club: "8i",  upAndDown: null,  sandSave: null, notes: "" },
  { holeNumber: 4,  par: 4, score: 4, putts: 2, fairway: "hit",   gir: "hit",  girMissDirection: [],           pinPosition: "center", penalties: 0, club: "9i",  upAndDown: null,  sandSave: null, notes: "" },
  { holeNumber: 5,  par: 5, score: 6, putts: 2, fairway: "left",  gir: "miss", girMissDirection: ["short", "left"], pinPosition: "back", penalties: 1, club: "5i", upAndDown: false, sandSave: null, notes: "Penalty off tee" },
  { holeNumber: 6,  par: 4, score: 4, putts: 2, fairway: "hit",   gir: "hit",  girMissDirection: [],           pinPosition: "center", penalties: 0, club: "8i",  upAndDown: null,  sandSave: null, notes: "" },
  { holeNumber: 7,  par: 3, score: 3, putts: 2, fairway: null,    gir: "hit",  girMissDirection: [],           pinPosition: "front",  penalties: 0, club: "7i",  upAndDown: null,  sandSave: null, notes: "" },
  { holeNumber: 8,  par: 4, score: 5, putts: 2, fairway: "hit",   gir: "miss", girMissDirection: ["long"],     pinPosition: "center", penalties: 0, club: "PW",  upAndDown: false, sandSave: null, notes: "" },
  { holeNumber: 9,  par: 4, score: 4, putts: 1, fairway: "hit",   gir: "miss", girMissDirection: ["short"],    pinPosition: "front",  penalties: 0, club: "9i",  upAndDown: true,  sandSave: null, notes: "Great up and down" },
];

export const mockDetailedRounds: Record<string, DetailedRound> = {
  "1": {
    id: "1",
    courseName: "Pebble Beach",
    date: "Feb 9, 2026",
    slope: 142,
    courseRating: 72.3,
    holeCount: 18,
    players: [{ name: "Me", holes: pebbleBeachHoles }],
    status: "completed",
  },
  "active-1": {
    id: "active-1",
    courseName: "Pebble Beach",
    date: "Feb 11, 2026",
    slope: 142,
    courseRating: 72.3,
    holeCount: 18,
    players: [
      { name: "Me", holes: activeRoundHoles },
      { name: "Dave", holes: activeRoundHoles.map(h => ({ ...h, score: h.score + Math.floor(Math.random() * 3) - 1, putts: Math.min(h.putts + (Math.random() > 0.5 ? 1 : 0), 4) })) },
    ],
    status: "active",
  },
};

// Helper to get a round by ID (returns Pebble Beach data as fallback for any ID)
export function getMockRound(id: string): DetailedRound {
  return mockDetailedRounds[id] ?? mockDetailedRounds["1"]!;
}

// ── Club performance aggregation ──

export interface ClubStat {
  club: string;
  approaches: number;
  girHit: number;
  girPercent: number;
  avgMiss: string;
}

export function getClubStats(holes: HoleData[]): ClubStat[] {
  const clubMap = new Map<string, { approaches: number; girHit: number; misses: MissDirection[] }>();
  for (const h of holes) {
    if (!h.club) continue;
    const entry = clubMap.get(h.club) ?? { approaches: 0, girHit: 0, misses: [] };
    entry.approaches++;
    if (h.gir === "hit") entry.girHit++;
    else entry.misses.push(...h.girMissDirection);
    clubMap.set(h.club, entry);
  }
  return Array.from(clubMap.entries())
    .map(([club, d]) => ({
      club,
      approaches: d.approaches,
      girHit: d.girHit,
      girPercent: d.approaches > 0 ? Math.round((d.girHit / d.approaches) * 100) : 0,
      avgMiss: d.misses.length > 0 ? mostCommon(d.misses) : "—",
    }))
    .sort((a, b) => b.approaches - a.approaches);
}

function mostCommon(arr: string[]): string {
  const freq = new Map<string, number>();
  for (const v of arr) freq.set(v, (freq.get(v) ?? 0) + 1);
  let best = arr[0]!;
  let bestCount = 0;
  for (const [k, c] of freq) if (c > bestCount) { best = k; bestCount = c; }
  const labels: Record<string, string> = { short: "S", long: "L", left: "←", right: "→" };
  return labels[best] ?? best;
}

// ── Round stats aggregation ──

export interface RoundStats {
  totalScore: number;
  totalPar: number;
  vsPar: number;
  totalPutts: number;
  puttsPerHole: number;
  girCount: number;
  girTotal: number;
  girPercent: number;
  fwHit: number;
  fwTotal: number;
  fwPercent: number;
  scramblingConverted: number;
  scramblingAttempts: number;
  scramblingPercent: number;
  penalties: number;
  sandSaveConverted: number;
  sandSaveAttempts: number;
}

export function getRoundStats(holes: HoleData[]): RoundStats {
  let totalScore = 0, totalPar = 0, totalPutts = 0;
  let girCount = 0, girTotal = 0, fwHit = 0, fwTotal = 0;
  let scramblingConverted = 0, scramblingAttempts = 0, penalties = 0;
  let sandSaveConverted = 0, sandSaveAttempts = 0;

  for (const h of holes) {
    totalScore += h.score;
    totalPar += h.par;
    totalPutts += h.putts;
    girTotal++;
    if (h.gir === "hit") girCount++;
    if (h.par >= 4 && h.fairway !== null) {
      fwTotal++;
      if (h.fairway === "hit") fwHit++;
    }
    if (h.gir === "miss") {
      scramblingAttempts++;
      if (h.score <= h.par) scramblingConverted++;
    }
    penalties += h.penalties;
    if (h.sandSave !== null) {
      sandSaveAttempts++;
      if (h.sandSave) sandSaveConverted++;
    }
  }

  return {
    totalScore, totalPar,
    vsPar: totalScore - totalPar,
    totalPutts,
    puttsPerHole: holes.length > 0 ? totalPutts / holes.length : 0,
    girCount, girTotal,
    girPercent: girTotal > 0 ? Math.round((girCount / girTotal) * 100) : 0,
    fwHit, fwTotal,
    fwPercent: fwTotal > 0 ? Math.round((fwHit / fwTotal) * 100) : 0,
    scramblingConverted, scramblingAttempts,
    scramblingPercent: scramblingAttempts > 0 ? Math.round((scramblingConverted / scramblingAttempts) * 100) : 0,
    penalties,
    sandSaveConverted, sandSaveAttempts,
  };
}

// ── Trend data ──

export interface TrendPoint {
  date: string;
  score: number;
  vsPar: number;
  girPercent: number;
  puttsPerHole: number;
  scramblingPercent: number;
}

export const mockTrendData: TrendPoint[] = [
  { date: "Dec 30", score: 75, vsPar: 3, girPercent: 61, puttsPerHole: 1.61, scramblingPercent: 57 },
  { date: "Jan 8", score: 79, vsPar: 7, girPercent: 44, puttsPerHole: 1.78, scramblingPercent: 40 },
  { date: "Jan 15", score: 76, vsPar: 4, girPercent: 56, puttsPerHole: 1.72, scramblingPercent: 50 },
  { date: "Jan 20", score: 72, vsPar: 0, girPercent: 72, puttsPerHole: 1.56, scramblingPercent: 60 },
  { date: "Jan 28", score: 81, vsPar: 9, girPercent: 44, puttsPerHole: 1.89, scramblingPercent: 30 },
  { date: "Feb 5", score: 78, vsPar: 6, girPercent: 50, puttsPerHole: 1.83, scramblingPercent: 44 },
  { date: "Feb 9", score: 74, vsPar: 2, girPercent: 61, puttsPerHole: 1.67, scramblingPercent: 57 },
];
