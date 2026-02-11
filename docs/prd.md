# Birdie — Product Requirements Document

_A serious golfer's stat tracker. Fast manual entry. Coach-grade insights. No hardware required._

_Last updated: February 11, 2026_

---

## 1. Product Vision

**Birdie** is a golf round tracker built for the player who's actively working on their game. It captures the data that actually drives improvement — not just scores and putts, but *where* you missed, *where* the pin was, and *what club* you hit. It's the data a tour caddie tracks in a yardage book, in an app that's fast enough to use between shots without slowing play.

Birdie is not a GPS app. It's not a social network. It's not a hardware accessory. It's a focused tool for a golfer who wants to turn 18 holes of play into 18 holes of data they can practice against.

### Design Principles

1. **Coach-grade data, caddie-speed entry.** Capture what matters without slowing play. Every input should take < 3 seconds.
2. **Offline is the default.** Assume no connectivity. Golf courses are cellular dead zones.
3. **Context over counts.** "Missed GIR short-right, pin back" is useful. "GIR: 61%" is not. Always capture the *why* alongside the *what*.
4. **Opinionated defaults.** Don't ask the golfer to configure — make smart assumptions and let them override. A par 4 defaults to driver off the tee. A par 3 defaults to no fairway tracking. Get out of the way.
5. **Patterns, not numbers.** The post-round dashboard should answer "what should I practice?" — not recite percentages.

---

## 2. Target User

**The Competitive Amateur**: Handicap index 0–12. Plays 2–6 rounds per month. Has a coach or self-coaches using stats. Currently tracks detailed notes on paper, in a spreadsheet, or has tried Arccos but found it too expensive or unreliable. Owns a rangefinder for distances. Doesn't need another GPS app — needs a smart way to log what happened and why.

This player already thinks about their game in terms of GIR, scrambling, miss tendencies, and club gapping. They don't need to be taught *what* to track — they need an app that makes tracking *fast* and the resulting data *actionable*.

Secondary user: **The Golf Coach** who wants clients to self-report round data in a structured, consistent format.

---

## 3. MVP Scope — What We're Building (Day 1)

### 3.1 Start a Round

- **No account required.** App opens, tap "New Round."
- **Course name** — freeform text field. Optional. "Pebble Beach" or "Home Course" or blank.
- **Tee and rating (optional).** Two fields: slope and course rating. Entered once, stored for handicap context. Can be skipped.
- **Player setup.** Default: 1 player named "Me." Can add up to 4. Names are freeform (first names/nicknames).
- **Hole count.** Toggle: 9 or 18. Default: 18.
- **Par entry.** Quick-set: choose a total par (70/71/72) which distributes as all par-4s, then tap individual holes to set par-3s and par-5s. Common layouts (e.g., "4 par-3s, 4 par-5s, 10 par-4s") available as one-tap presets. Pars can also be entered per-hole during play.
- **Tap "Go"** → Hole 1, ready to score.

### 3.2 Per-Hole Score Entry (The Core Loop)

This is where Birdie earns its keep. The screen is a **single, vertically stacked card** for each hole. All fields are visible without scrolling. Designed for one-thumb entry.

#### Primary Fields (always shown)

| Field | Input Type | Default | Notes |
|---|---|---|---|
| **Score** | Stepper (−/+) | Par | Large buttons, big number. The hero element. |
| **Putts** | Stepper (−/+) | 2 | Range: 0–6. |
| **Fairway** (par 4 & 5 only) | 3-way toggle: ← HIT → | None (must select) | Left = miss left, center = hit, right = miss right. Hidden on par 3s (no fairway). |
| **Green in Regulation** | Tap: HIT or MISS | Auto-derived from score + putts* | If score minus putts ≤ par minus 2, auto-marks GIR hit. Player can override. |
| **GIR Miss Direction** (if GIR = miss) | 4-way selector: Short / Long / Left / Right | None | Appears only when GIR is missed. Can select multiple (e.g., short-left). Compact diamond/cross layout for fast tapping. |
| **Pin Position** | 3-way toggle: Front / Center / Back | Center | One tap to change. Stays visible on every hole. |

*\*Auto-derivation: If a player scores 4 on a par 4 with 2 putts, they reached the green in 2 (par minus 2) = GIR hit. If they score 4 with 1 putt, they reached the green in 3 = GIR missed, but got up and down. The auto-calc handles common cases; manual override handles everything else.*

#### Secondary Fields (expandable, one tap to reveal)

| Field | Input Type | Notes |
|---|---|---|
| **Penalty strokes** | Stepper (−/+), default 0 | Captures penalty count within the score. |
| **Club into green** | Scrollable pill selector: W, 3i–9i, PW, GW, SW, LW | What club was the approach/tee shot (on par 3s)? Enables club-level GIR and distance analysis. |
| **Up-and-down** (if GIR = miss) | Toggle: Yes / No | Did you save par (or better) after missing the green? Auto-derived from GIR miss + score ≤ par, but can override. |
| **Sand save** (if applicable) | Toggle: Yes / No | Was the miss from a bunker + did you get up and down? |
| **Notes** | Freeform text, 1 line | "Wind was 2-club into." "Plugged lie in bunker." For the golfer's own post-round review. |

#### Navigation & State

- **Swipe left/right** to move between holes. Tap hole number for picker.
- **Running totals always visible** at top: total score, score vs. par, total putts, GIR count (e.g., "7/12 GIR"), fairways hit (e.g., "5/8 FW").
- **Auto-save on every change.** No save button. Data persists to local storage on every single tap.
- **Active player selector** at top for multiplayer. Tap a name to switch whose stats you're entering. One player at a time keeps the screen uncluttered.

#### UX Priority

The primary fields must be completable in **under 8 seconds per hole** for a single player. The secondary fields add ~5 more seconds if used. A golfer entering all data for a solo round should spend **no more than 2–3 minutes total** across 18 holes. This is comparable to writing on a paper card — but the data is structured and queryable.

### 3.3 Scorecard View

- **Full-card grid.** Landscape orientation. Players × Holes. Styled like a traditional scorecard.
- **Color coding.** Eagle+ (gold), birdie (red circle), par (neutral), bogey (blue square), double+ (black double-square). Follows standard scorecard conventions.
- **Stat row below scores.** For each player: putts, GIR (✓/✗), fairway (←/✓/→) per hole. Dense but scannable.
- **Front 9 / Back 9 / Total** subtotals for score, putts, GIR count, FW%.
- **Accessible via "Card" button** from score entry. Tapping a cell in the card jumps back to that hole for editing.

### 3.4 Post-Round Dashboard

This is what the golfer looks at in the parking lot after the round. It answers: **"What should I practice this week?"**

#### Stat Summary

| Stat | Display |
|---|---|
| Score / vs. Par | "74 (+2)" |
| Putts | "30 total, 1.67/hole" |
| GIR | "11/18 (61%)" |
| Fairways | "9/14 (64%)" |
| Scrambling | "4/7 (57%)" — saved par from 7 GIR misses |
| Sand Saves | "1/2 (50%)" — if applicable |
| Penalties | "2 strokes" |

#### Miss Pattern Visualization (The Key Differentiator)

A **green-shaped oval** with dots plotted for every GIR miss in the round:

- Each dot is positioned based on miss direction (short/long/left/right).
- Dots are color-coded by **pin position** that hole (front = blue, center = gray, back = red).
- At a glance, the golfer sees: "I missed short on 5 of 7 holes, and 4 of those were back pins. I'm under-clubbing when the pin is deep."

This is the visualization no other app provides. It turns raw data into an obvious practice plan.

#### Club Performance Table (if club data entered)

| Club | Approaches | GIR | GIR% | Avg Miss |
|---|---|---|---|---|
| 7i | 5 | 3 | 60% | Short |
| 8i | 4 | 3 | 75% | — |
| PW | 3 | 2 | 67% | Long |

Shows which clubs are reliable and which need work.

### 3.5 Round History

- **List of completed rounds.** Date, course name, score, vs. par, key stats (GIR%, FW%, putts).
- **Sorted by date**, most recent first.
- **Tap to reopen** full scorecard and post-round dashboard.
- **Delete or archive** via swipe.

### 3.6 Trends & Patterns (Multi-Round)

For a golfer with 5+ rounds of data, Birdie surfaces patterns across rounds:

- **Score trend line.** Simple line chart: score over time. Secondary line for vs. par.
- **GIR % trend.** Are you hitting more greens over time?
- **Putts per GIR trend.** Are you converting better when you do hit greens?
- **Cumulative miss map.** The same green-oval visualization from the post-round dashboard, but aggregated across all rounds. Now you see your *career* miss pattern, not just one round. "Over 15 rounds, I miss short-right 40% of the time." That's a swing lesson in one picture.
- **Scrambling trend.** Up-and-down conversion over time — is short game practice paying off?

Each trend shows a simple line or aggregate. No Strokes Gained formulas. No complex statistical models. Just: here's what you do, here's whether it's getting better or worse.

### 3.7 Data Persistence

- **Postgres is the source of truth.** All completed round data lives in PostgreSQL. Queryable, relational, backed up with `pg_dump` (local) or automatic point-in-time recovery (cloud).
- **localStorage is the safety net.** Zustand's persist middleware writes the active scoring session to localStorage on every tap. Survives app crashes, tab closes, and phone restarts. Cleared once the round is successfully written to Postgres.
- **Export as CSV.** Per-round export with all fields (score, putts, GIR, miss direction, pin position, club, penalties, notes). Compatible with any spreadsheet or coach's tracking system.
- **Export as JSON.** Full data dump for backup or migration. The golfer owns their data.

---

## 4. What We're NOT Building (Deliberate Cuts)

| Feature | Why it's cut |
|---|---|
| GPS / Rangefinder | Serious golfers already have a Bushnell or Garmin. GPS drains battery and adds complexity for a redundant feature. |
| Shot-by-shot mapping | Requires GPS or hardware. Our miss direction capture provides 80% of the value with 0% of the hardware cost. |
| Handicap calculation | WHS formula is complex and requires course slope/rating database. Post-MVP — for now, the golfer knows their handicap. |
| Course database | Maintaining 40K courses is infrastructure, not product. Freeform text + optional slope/rating is sufficient. |
| Social features | Birdie is a practice tool, not a social network. Serious golfers share stats with their coach, not a feed. |
| AI insights / coaching | The data speaks for itself. "You miss short-right" doesn't need an AI wrapper. Post-MVP consideration. |
| User accounts / auth | Not needed for local-only. Required when cloud sync is added. |
| Strokes Gained | Requires benchmark data (PGA Tour averages by distance/lie). High value but high complexity. Phase 2. |
| Distance tracking | No GPS = no distances. The golfer enters club, not yardage. Club trends are more actionable for practice anyway. |

---

## 5. Technical Architecture

### Platform
Next.js web app. Server-rendered pages for data-heavy views (history, dashboard, trends), client-side interactive components for scoring. One codebase, two deployment paths (local Docker or cloud).

### Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Server Components for data views, Client Components for scoring. Built-in routing, Server Actions for mutations. |
| Database | PostgreSQL 16 | Source of truth. Relational schema maps cleanly to rounds → players → hole_data. Aggregation queries power dashboards and trends natively in SQL. |
| ORM | Drizzle ORM | Type-safe, schema-as-code, auto-generated migrations. Zero runtime overhead. |
| Styling | Tailwind CSS | Rapid UI development, consistent design system |
| Components | shadcn/ui (Radix) | Accessible building blocks styled with Tailwind. Custom golf components built on top. |
| Charts | Custom SVG | Hand-built line charts for trends, custom SVG for miss map visualization. No Recharts dependency. |
| State | Zustand + localStorage | Active scoring session in memory. Zustand's persist middleware writes to localStorage on every change — auto-save and crash recovery with zero extra dependencies. |
| Auth | Auth.js (NextAuth v5) | Added last. Swappable providers (credentials, OAuth). Same API for both deployment paths. |

Full technical details, deployment paths (local + cloud), and auth architecture in **docs/tech-stack.md**.

### Data Model (Drizzle Schema)

Three normalized Postgres tables:

```
rounds
  id: uuid (PK)
  userId: text (default "local")
  courseName: text (optional)
  slope: real (optional)
  courseRating: real (optional)
  holeCount: integer (9 | 18)
  pars: jsonb (number[])
  status: enum ("active" | "completed")
  date: timestamp
  createdAt: timestamp
  updatedAt: timestamp

players
  id: uuid (PK)
  roundId: uuid (FK → rounds, cascade delete)
  name: text
  sortOrder: integer

hole_data
  id: uuid (PK)
  playerId: uuid (FK → players, cascade delete)
  holeNumber: integer (1-indexed)
  score: integer | null
  putts: integer | null
  fairway: enum ("left" | "hit" | "right") | null
  gir: enum ("hit" | "miss") | null
  girMissDirection: jsonb (string[]) | null     -- e.g., ["short", "right"]
  pinPosition: enum ("front" | "center" | "back")
  penalties: integer (default 0)
  club: text | null                              -- e.g., "7i", "PW"
  upAndDown: boolean | null
  sandSave: boolean | null
  notes: text | null
```

### Derived Stats (computed via SQL or pure functions, not stored)

```
RoundStats {
  totalScore, vsPar, totalPutts, puttsPerHole,
  girCount, girPercent,
  girMissPattern: { short, long, left, right },
  girMissByPin: { front: direction[], center: direction[], back: direction[] },
  fairwayHitCount, fairwayPercent,
  fairwayMissPattern: { left, right },
  scramblingAttempts, scramblingConverted, scramblingPercent,
  sandSaveAttempts, sandSaveConverted,
  penaltyStrokes,
  clubStats: { [club]: { attempts, girHit, avgMiss } }
}
```

### Data Persistence Strategy

Postgres is the source of truth. localStorage is the crash-recovery and auto-save buffer.

- **Scoring (on-course):** Client Component + Zustand. Every tap updates Zustand in memory (instant) and persists to localStorage via Zustand's `persist` middleware (synchronous, instant). On hole completion or periodic debounce, a Server Action writes to Postgres. If the server call fails, data is safe in localStorage and retries on next trigger.
- **Data views (off-course):** Server Components fetch directly from Postgres. History, dashboard, and trends are server-rendered — no client-side data fetching.
- **Crash recovery:** If the app crashes, tab closes, or phone dies mid-round, Zustand restores the full scoring state from localStorage on next open. Scoring resumes exactly where it left off. Unsaved data pushes to Postgres on the next successful Server Action call.
- **Round completion:** "Finish Round" writes all remaining data to Postgres, sets status to completed, clears localStorage for that round, and redirects to the dashboard.

---

## 6. UX & Visual Design Direction

### Color Palette

| Token | Hex | Role |
|---|---|---|
| **Black Forest** | `#283618` | Primary background. Dark, earthy green — the base of every screen. Headers, nav, card backgrounds. |
| **Olive Leaf** | `#606C38` | Secondary background and borders. Distinguishes sections within a dark layout (e.g., hole card background vs. page background). Active/selected states on toggles. |
| **Cornsilk** | `#FEFAE0` | Primary text and foreground. Warm off-white — high contrast against both greens, readable in direct sunlight. Score numbers, labels, stat values. |
| **Sunlit Clay** | `#DDA15E` | Accent / interactive. Buttons, active toggle highlights, stepper controls, links, the "New Round" CTA. Warm gold draws the eye without clashing. |
| **Copperwood** | `#BC6C25` | Emphasis / alert. Birdie indicators on the scorecard, important stat callouts, trend line highlights. Darker than Sunlit Clay — used sparingly for visual weight. |

#### Application

- **Backgrounds:** Black Forest (`#283618`) as the primary surface. Olive Leaf (`#606C38`) for elevated cards, input groups, and the scorecard grid rows.
- **Text:** Cornsilk (`#FEFAE0`) for primary text. Sunlit Clay (`#DDA15E`) for labels, secondary text, and de-emphasized info.
- **Interactive elements:** Sunlit Clay (`#DDA15E`) for buttons, stepper +/− controls, active toggles. Copperwood (`#BC6C25`) for hover/pressed states.
- **Scorecard color coding:** Eagle+ = Copperwood (`#BC6C25`), birdie = Sunlit Clay (`#DDA15E`), par = Cornsilk (`#FEFAE0`), bogey = Olive Leaf (`#606C38`) with Cornsilk text, double+ = muted/dimmed.
- **Miss map dots:** Colored by pin position — Front = Sunlit Clay, Center = Cornsilk, Back = Copperwood. Green oval fill = Olive Leaf on Black Forest background.
- **Charts/trends:** Line strokes in Sunlit Clay and Copperwood against a Black Forest background. Grid lines in Olive Leaf.

### Design Principles

- **Earthy, not flashy.** The palette evokes a walk through the course at golden hour — warm, grounded, professional. No neon, no gradients, no playfulness.
- **Information-dense but scannable.** Serious golfers want to see data. Don't hide it behind taps. Use visual hierarchy (size, weight, color) to make the most important data (score, GIR, miss) pop.
- **Large touch targets where speed matters.** Score stepper, fairway toggle, GIR toggle — all 48px+ targets. Designed for thumbs, in sun, possibly wearing a glove on one hand.
- **High contrast / sunlight-readable.** Cornsilk on Black Forest is high-contrast and warm. Tested against WCAG AA. Avoid Olive Leaf text on Black Forest (too low contrast) — Olive Leaf is for backgrounds and borders, not text.
- **Compact secondary fields.** Club selector and notes are tucked in a collapsible section. They're there for the golfer who wants full data but don't clutter the core loop.
- **Miss map as visual centerpiece.** The green-oval miss pattern visualization should be the first thing you see on the post-round screen. It's Birdie's signature view — the one screenshot you'd share with your coach.
- **Haptic feedback** on toggles and steppers. Confirms input without looking.
- **Three core views.** Score (per-hole entry), Card (full scorecard grid), Stats (post-round dashboard + trends). Clean top navigation. No hamburger menus, no side drawers.

---

## 7. Success Metrics

| Metric | Target | Why it matters |
|---|---|---|
| Hole data completeness | > 90% of fields filled per round | Golfers find the entry fast enough to use all fields |
| Time per hole (all primary fields) | < 8 seconds | Entry doesn't slow play |
| Rounds completed | > 85% of started rounds | Full-round data, not abandoned after 6 holes |
| Return usage | 3+ rounds within 30 days | Golfer builds a dataset they rely on |
| Post-round dashboard views | > 1.5x per round | Golfer reviews their data (the whole point) |
| PWA install rate | > 30% of visitors | Serious golfers want it on their home screen |

---

## 8. Future Considerations (Post-MVP)

Ordered by value to the serious golfer:

1. **Strokes Gained analysis** — using PGA Tour benchmark data by shot category. The gold standard of golf analytics. Requires significant reference data but transforms the dashboard.
2. **Cloud sync + coach sharing** — sync across devices, share structured data with a coach via link or export. The "send my stats to my instructor" workflow.
3. **Proximity tracking** — "Approach finished X feet from the pin." Adds a field per hole but enables putt-quality analysis and SG: Approach.
4. **First putt distance** — short (< 10ft), medium (10–25ft), long (25ft+). Combined with putts-per-hole, reveals whether putting issues are lag putts or short putts.
5. **Lie type for approach** — fairway, rough, bunker, other. Adds context to GIR miss data.
6. **Handicap calculation** — unofficial WHS index from stored rounds with slope/rating.
7. **Apple Watch companion** — quick score + putts + GIR entry from the wrist. Ideal for the golfer who doesn't want to pull out their phone.
8. **Course templates** — save par layouts for courses you play regularly. One-tap to reuse.
9. **Practice session logger** — track range sessions with specific drills linked to miss patterns. "You miss short-right → here are short-right drills."
10. **Share scorecard as image** — generate a clean, branded scorecard graphic for group chats.

---

## 9. Open Questions

1. **GIR miss direction granularity**: 4-way (short/long/left/right) vs. 8-way (adding short-left, short-right, long-left, long-right)? 4-way with multi-select (tap "short" + "right") keeps the UI simpler while capturing diagonal misses. Needs user testing.
2. **Pin position left/right**: Should we track left/center/right in addition to front/center/back? Full pin position is a 3×3 grid (9 positions). Adds accuracy but adds a tap. The front/center/back axis affects club selection the most — left/right is secondary. Start with 3-way, consider expanding.
3. **Per-hole par entry timing**: Set all pars before round starts, or enter par per-hole during play? Serious golfers usually know the layout. Pre-set with quick edit is probably better.
4. **Multiplayer stat depth**: In a foursome, does the user enter full stats for all 4 players or just themselves? Likely: full stats for self, score-only for playing partners. Should this be configurable per player?
5. **Club list customization**: Should the golfer be able to set their bag (e.g., "I carry a 4-hybrid, not a 4-iron") or is the default list (W, 3W, 3i–9i, PW, GW, SW, LW, Putter) sufficient?

---

## 10. One-Day Build Plan

| Block | Time | Deliverable |
|---|---|---|
| **Morning (2.5h)** | Setup + Data Layer | Next.js + Tailwind + shadcn/ui scaffolding. Docker Postgres up. Drizzle schema (`rounds`, `players`, `hole_data`) + migrations. Server Actions for round CRUD. Zustand scoring store with localStorage persist. Derived stat functions. |
| **Late Morning (2.5h)** | Core Scoring Loop | New round setup page (course name, players, pars). Per-hole scoring Client Component: score stepper, putts stepper, fairway toggle, GIR toggle, miss direction diamond, pin position toggle. Auto-GIR derivation. Swipe navigation. Running totals header. Auto-save to localStorage + Server Action writes to Postgres. Active player switching. |
| **Early Afternoon (1.5h)** | Scorecard + History | Full scorecard grid Server Component with stat rows (putts, GIR, FW per hole). Color coding. Front/Back/Total subtotals. Round history page (Server Component, SQL query). Tap to reopen. Swipe to delete. |
| **Late Afternoon (1.5h)** | Post-Round Dashboard | Stat summary panel (Server Component, SQL aggregation). **Miss pattern green-oval visualization** (SVG — plot miss dots by direction, colored by pin). Club performance table. |
| **End of Day (1h)** | Trends + Polish + Ship | Multi-round trend lines (score, GIR%, putts, scrambling). Cumulative miss map across rounds. CSV/JSON export. Responsive + sunlight-readable contrast. Deploy to Vercel + Neon (or local Docker). Test full round flow on real phone. |

**Total: ~9 hours.** Tight but achievable for a focused developer who knows Next.js and Drizzle. The miss-pattern visualization is the riskiest item — budget extra time there if needed, cut multi-round trends to a simple table if SVG takes too long.

---

_Birdie: Know your misses. Fix your game._
