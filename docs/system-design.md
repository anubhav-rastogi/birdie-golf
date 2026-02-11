# Birdie — System Design

_Entities, tables, endpoints, data flow, caching, and security._

_Last updated: February 11, 2026_

This document describes the complete backend architecture: how data is structured, how it moves through the system, what powers every screen, and how it's protected. Visual design is in **docs/ui-guidelines.md**. Screen behavior is in **docs/ux-design.md**. Stack rationale is in **docs/tech-stack.md**.

---

## 1. Domain Model

### 1.1 Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│   User   │ 1───* │  Round   │ 1───* │  Player  │ 1───* ┌──────────┐
│(post-MVP)│       │          │       │          │       │ HoleData │
└──────────┘       └──────────┘       └──────────┘       └──────────┘
```

Four entities. Three in MVP (`Round`, `Player`, `HoleData`). `User` is added post-MVP when auth is wired in.

### 1.2 Entity Definitions

#### User (post-MVP)

The golfer. Owns rounds. Absent in MVP — all data belongs to a synthetic `"local"` user.

| Field | Type | Notes |
|---|---|---|
| id | `uuid` | PK |
| email | `text` | Unique. Login identifier. |
| passwordHash | `text` | bcrypt. Only for Credentials provider. Null if OAuth-only. |
| name | `text` | Display name. |
| createdAt | `timestamp` | |

#### Round

A single golf outing. Contains metadata about the course and the scoring session.

| Field | Type | Notes |
|---|---|---|
| id | `uuid` | PK, auto-generated. |
| userId | `text` | FK → User (or `"local"` in MVP). Default `"local"`. |
| courseName | `text?` | Freeform. Optional. "Pebble Beach" or blank. |
| slope | `real?` | Course slope rating. Optional. |
| courseRating | `real?` | Course rating (e.g. 72.3). Optional. |
| holeCount | `int` | `9` or `18`. Default `18`. |
| pars | `jsonb` | `number[]` — par for each hole. e.g. `[4,4,3,4,5,4,4,3,4,4,4,3,4,5,4,4,3,4]` |
| status | `enum` | `"active"` or `"completed"`. |
| date | `timestamp` | When the round was played. |
| createdAt | `timestamp` | Row creation time. |
| updatedAt | `timestamp` | Last modification time. |

**Constraints**: One active round per user at a time (enforced in application logic, not DB constraint — keeps schema simple).

#### Player

A participant in a round. Default: one player named "Me". Up to 4 per round.

| Field | Type | Notes |
|---|---|---|
| id | `uuid` | PK. |
| roundId | `uuid` | FK → Round. Cascade delete. |
| name | `text` | Player display name. |
| sortOrder | `int` | Display order. 0-indexed. |

#### HoleData

One row per player per hole. This is where 95% of the data lives.

| Field | Type | Notes |
|---|---|---|
| id | `uuid` | PK. |
| playerId | `uuid` | FK → Player. Cascade delete. |
| holeNumber | `int` | 1-indexed. Range: 1–18. |
| score | `int?` | Strokes taken. Null if not yet entered. |
| putts | `int?` | Number of putts. Range: 0–6. |
| fairway | `enum?` | `"left"`, `"hit"`, `"right"`. Null on par 3s or if not recorded. |
| gir | `enum?` | `"hit"` or `"miss"`. Auto-derived from score/putts/par, manually overridable. |
| girMissDirection | `jsonb?` | `string[]` — e.g. `["short", "right"]`. Multi-select. |
| pinPosition | `enum` | `"front"`, `"center"`, `"back"`. Default `"center"`. |
| penalties | `int` | Penalty strokes within the score. Default `0`. |
| club | `text?` | Approach club. e.g. `"7i"`, `"PW"`. Null if not recorded. |
| upAndDown | `bool?` | Did player save par after missing GIR? Null if GIR hit. |
| sandSave | `bool?` | Did player save from bunker? Null if no bunker. |
| notes | `text?` | Freeform single-line note. |

**Unique constraint**: `(playerId, holeNumber)` — one entry per player per hole.

### 1.3 Derived Data (Computed, Never Stored)

These are calculated at read time via SQL aggregation or pure TypeScript functions. Never persisted.

```typescript
interface RoundStats {
  totalScore: number;         // SUM(score)
  totalPar: number;           // SUM(par) from round.pars
  vsPar: number;              // totalScore - totalPar
  totalPutts: number;         // SUM(putts)
  puttsPerHole: number;       // totalPutts / holesPlayed

  girCount: number;           // COUNT(gir = 'hit')
  girTotal: number;           // COUNT(gir IS NOT NULL)
  girPercent: number;         // girCount / girTotal * 100

  fwHit: number;              // COUNT(fairway = 'hit')
  fwTotal: number;            // COUNT(fairway IS NOT NULL) — excludes par 3s
  fwPercent: number;

  scramblingConverted: number; // GIR miss + score ≤ par
  scramblingAttempts: number;  // GIR misses
  scramblingPercent: number;

  sandSaveConverted: number;
  sandSaveAttempts: number;

  penalties: number;           // SUM(penalties)

  // Miss pattern aggregations (used by MissMap & PRD §3.4)
  girMissPattern: { short: number; long: number; left: number; right: number };
  girMissByPin: {
    front: string[][];   // Array of miss direction combos, e.g. [["short","right"],["left"]]
    center: string[][];
    back: string[][];
  };
  fairwayMissPattern: { left: number; right: number };
}

interface ClubStat {
  club: string;               // "7i", "PW", etc.
  approaches: number;         // Times used
  girHit: number;             // GIR hit with this club
  girPercent: number;
  avgMiss: string;            // Most common miss direction, or "—"
}

interface TrendPoint {
  roundId: string;
  date: string;
  courseName: string;
  score: number;
  vsPar: number;
  girPercent: number;
  puttsPerHole: number;
  puttsPerGIR: number;           // Average putts on GIR-hit holes only
  scramblingPercent: number;
  fwPercent: number;
}
```

---

## 2. Database Tables

### 2.1 Drizzle Schema

The Drizzle ORM schema defines both the TypeScript types and the Postgres DDL. This is the single source of truth for database structure.

```typescript
// src/lib/db/schema.ts

import { pgTable, uuid, text, integer, timestamp,
         pgEnum, jsonb, real, boolean, uniqueIndex } from "drizzle-orm/pg-core";

// ── Enums ──

export const roundStatusEnum = pgEnum("round_status", ["active", "completed"]);
export const fairwayEnum     = pgEnum("fairway", ["left", "hit", "right"]);
export const girEnum         = pgEnum("gir", ["hit", "miss"]);
export const pinPositionEnum = pgEnum("pin_position", ["front", "center", "back"]);

// ── Tables ──

export const rounds = pgTable("rounds", {
  id:           uuid("id").primaryKey().defaultRandom(),
  userId:       text("user_id").notNull().default("local"),
  courseName:   text("course_name"),
  slope:        real("slope"),
  courseRating:  real("course_rating"),
  holeCount:    integer("hole_count").notNull().default(18),
  pars:         jsonb("pars").$type<number[]>(),
  status:       roundStatusEnum("status").notNull().default("active"),
  date:         timestamp("date").notNull().defaultNow(),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
});

export const players = pgTable("players", {
  id:        uuid("id").primaryKey().defaultRandom(),
  roundId:   uuid("round_id").notNull()
               .references(() => rounds.id, { onDelete: "cascade" }),
  name:      text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const holeData = pgTable("hole_data", {
  id:               uuid("id").primaryKey().defaultRandom(),
  playerId:         uuid("player_id").notNull()
                      .references(() => players.id, { onDelete: "cascade" }),
  holeNumber:       integer("hole_number").notNull(),
  score:            integer("score"),
  putts:            integer("putts"),
  fairway:          fairwayEnum("fairway"),
  gir:              girEnum("gir"),
  girMissDirection: jsonb("gir_miss_direction").$type<string[]>(),
  pinPosition:      pinPositionEnum("pin_position").default("center"),
  penalties:        integer("penalties").default(0),
  club:             text("club"),
  upAndDown:        boolean("up_and_down"),
  sandSave:         boolean("sand_save"),
  notes:            text("notes"),
}, (table) => [
  uniqueIndex("hole_data_player_hole_idx").on(table.playerId, table.holeNumber),
]);
```

### 2.2 Indexes

| Index | Table | Columns | Purpose |
|---|---|---|---|
| `rounds_pkey` | rounds | `id` | Primary key lookup |
| `rounds_user_date_idx` | rounds | `(userId, date DESC)` | Round history list, sorted by date |
| `rounds_user_status_idx` | rounds | `(userId, status)` | Find active round for a user |
| `players_round_idx` | players | `(roundId)` | Fetch all players for a round |
| `hole_data_player_hole_idx` | hole_data | `(playerId, holeNumber)` UNIQUE | Upsert hole data, prevent duplicates |
| `hole_data_player_idx` | hole_data | `(playerId)` | Fetch all holes for a player |

### 2.3 Post-MVP Auth Tables (Auth.js / Drizzle Adapter)

When auth is added, Auth.js requires these additional tables. They're generated by `@auth/drizzle-adapter` and follow the Auth.js schema convention.

```typescript
export const users = pgTable("users", {
  id:            uuid("id").primaryKey().defaultRandom(),
  name:          text("name"),
  email:         text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image:         text("image"),
  passwordHash:  text("password_hash"),   // Only for Credentials provider
  createdAt:     timestamp("created_at").notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  id:                uuid("id").primaryKey().defaultRandom(),
  userId:            uuid("user_id").notNull()
                       .references(() => users.id, { onDelete: "cascade" }),
  type:              text("type").notNull(),
  provider:          text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token:     text("refresh_token"),
  access_token:      text("access_token"),
  expires_at:        integer("expires_at"),
  token_type:        text("token_type"),
  scope:             text("scope"),
  id_token:          text("id_token"),
  session_state:     text("session_state"),
});

export const sessions = pgTable("sessions", {
  id:           uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("session_token").notNull().unique(),
  userId:       uuid("user_id").notNull()
                  .references(() => users.id, { onDelete: "cascade" }),
  expires:      timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token:      text("token").notNull().unique(),
  expires:    timestamp("expires").notNull(),
});
```

---

## 3. API Endpoints (Server Actions)

All mutations go through Next.js Server Actions. There is **no REST API**. Server Components query the database directly via Drizzle — no API layer for reads.

### 3.1 Round Lifecycle

#### `createRound`

Creates a new round, its players, and empty hole data rows.

```
File: src/actions/rounds.ts
Trigger: "GO" button on New Round Setup page
```

| Parameter | Type | Notes |
|---|---|---|
| courseName | `string?` | Optional |
| slope | `number?` | Optional |
| courseRating | `number?` | Optional |
| holeCount | `9 \| 18` | |
| pars | `number[]` | Length = holeCount |
| players | `{ name: string }[]` | 1–4 players |

**Logic:**
1. Get `userId` from session (or `"local"`).
2. Check no active round exists for this user. If one does, return error.
3. `INSERT INTO rounds` with status `"active"`.
4. `INSERT INTO players` for each player, with `sortOrder`.
5. `INSERT INTO hole_data` — pre-create one row per player per hole (holeCount rows per player). Score/putts/etc. are null. Pin position defaults to `"center"`.
6. Return `{ roundId, playerIds }`.

**Response:**
```typescript
{ roundId: string; players: { id: string; name: string }[] }
```

#### `completeRound`

Marks a round as finished. Called from the "Finish Round" dialog.

```
File: src/actions/rounds.ts
Trigger: "Finish Round" confirmation dialog
```

| Parameter | Type | Notes |
|---|---|---|
| roundId | `string` | |

**Logic:**
1. Verify round belongs to current user and is `"active"`.
2. `UPDATE rounds SET status = 'completed', updatedAt = NOW() WHERE id = roundId`.
3. Call `revalidatePath("/rounds")` so the history page shows the new round.
4. Call `revalidatePath("/trends")` to refresh trend data.
5. Return `{ success: true }`.

#### `deleteRound`

Permanently removes a round and all its associated data (cascade).

```
File: src/actions/rounds.ts
Trigger: Swipe-to-delete on Round History, or keyboard Delete
```

| Parameter | Type | Notes |
|---|---|---|
| roundId | `string` | |

**Logic:**
1. Verify round belongs to current user.
2. `DELETE FROM rounds WHERE id = roundId`. Cascade handles players and hole_data.
3. `revalidatePath("/rounds")`.
4. `revalidatePath("/trends")`.
5. Return `{ success: true }`.

### 3.2 Scoring (On-Course)

#### `upsertHoleData`

Saves or updates data for a single hole for a single player. Called on a debounced timer (2s after last input) during active scoring.

```
File: src/actions/scoring.ts
Trigger: Debounced from Zustand store (every 2s after last input change)
```

| Parameter | Type | Notes |
|---|---|---|
| playerId | `string` | |
| holeNumber | `number` | 1-indexed |
| data | `Partial<HoleData>` | Only changed fields |

**Logic:**
1. Verify the player's round belongs to current user and is `"active"`.
2. `INSERT INTO hole_data ... ON CONFLICT (playerId, holeNumber) DO UPDATE SET ...` — upsert.
3. `UPDATE rounds SET updatedAt = NOW()` on the parent round.
4. Return `{ success: true }`.
5. On failure: swallow the error silently. Data is safe in localStorage. Will retry on next trigger.

#### `bulkUpsertHoleData`

Batch version of `upsertHoleData`. Used when completing a round (writes all remaining unsaved holes at once) or on page reload to sync localStorage → Postgres.

```
File: src/actions/scoring.ts
Trigger: completeRound flow, or page load with dirty localStorage data
```

| Parameter | Type | Notes |
|---|---|---|
| roundId | `string` | |
| holes | `{ playerId: string; holeNumber: number; data: Partial<HoleData> }[]` | All holes to upsert |

**Logic:**
1. Verify round ownership.
2. Batch upsert all holes in a single transaction.
3. Return `{ success: true, written: number }`.

### 3.3 Round Fetching (Client Hydration)

#### `fetchRound`

Fetches a full round with players and hole data. Used by Score Entry (Client Component) to hydrate the Zustand store when localStorage is empty or stale.

```
File: src/actions/rounds.ts
Trigger: Score Entry page mount, when Zustand store has no data for this roundId
```

| Parameter | Type | Notes |
|---|---|---|
| roundId | `string` | |

**Logic:**
1. Get `userId` from session (or `"local"`).
2. Call `getRoundWithHoles(roundId, userId)`.
3. Return the full round object with nested players and hole data, or `null` if not found / not owned.

**Response:**
```typescript
{ round: Round; players: (Player & { holes: HoleData[] })[] } | null
```

### 3.4 Data Export

#### `exportRoundCSV`

Generates a CSV string for a single round.

```
File: src/actions/export.ts (or src/lib/export.ts as a pure function)
Trigger: "CSV" export button on Post-Round Dashboard
```

| Parameter | Type |
|---|---|
| roundId | `string` |

**Output:** CSV string with headers:
```
Hole,Par,Score,Putts,Fairway,GIR,MissDirection,PinPosition,Penalties,Club,UpAndDown,SandSave,Notes
```

One section per player if multiplayer. File name: `birdie-{slugified-course-name}-{YYYY-MM-DD}.csv`.

#### `exportRoundJSON`

Full round data structure as JSON.

```
File: src/actions/export.ts
Trigger: "JSON" export button on Post-Round Dashboard
```

**Output:** Complete `Round` object with nested `Player[]` and `HoleData[][]`.

---

## 4. What Powers Each Screen

### 4.1 Landing Page (`/`)

| Aspect | Detail |
|---|---|
| **Rendering** | Static (Server Component). No database query. |
| **Data** | None. Pure marketing/onboarding content. |
| **Interactions** | "Open App" navigates to `/rounds`. |

### 4.2 Home — Round History (`/rounds`)

| Aspect | Detail |
|---|---|
| **Rendering** | Server Component. |
| **Primary query** | `SELECT id, courseName, date, status, holeCount, pars FROM rounds WHERE userId = $userId ORDER BY date DESC` |
| **Summary stats** | For each round, a subquery or join computes: total score, vs par, GIR%, FW%, total putts. These are lightweight aggregations over `hole_data` joined through `players`. |
| **Active round check** | `SELECT ... FROM rounds WHERE userId = $userId AND status = 'active' LIMIT 1` |
| **Mutations** | `deleteRound` Server Action on swipe-to-delete. |
| **Revalidation** | `revalidatePath("/rounds")` called after `createRound`, `completeRound`, `deleteRound`. |

**SQL for summary stats (per round):**
```sql
SELECT
  r.id,
  r.course_name,
  r.date,
  r.status,
  r.hole_count,
  r.pars,
  SUM(hd.score) as total_score,
  SUM(hd.putts) as total_putts,
  COUNT(CASE WHEN hd.gir = 'hit' THEN 1 END) as gir_hit,
  COUNT(CASE WHEN hd.gir IS NOT NULL THEN 1 END) as gir_total,
  COUNT(CASE WHEN hd.fairway = 'hit' THEN 1 END) as fw_hit,
  COUNT(CASE WHEN hd.fairway IS NOT NULL THEN 1 END) as fw_total
FROM rounds r
JOIN players p ON p.round_id = r.id AND p.sort_order = 0
JOIN hole_data hd ON hd.player_id = p.id
WHERE r.user_id = $1
GROUP BY r.id
ORDER BY r.date DESC;
```

### 4.3 New Round Setup (`/new-round`)

| Aspect | Detail |
|---|---|
| **Rendering** | Client Component (form with interactive state). |
| **Data** | None fetched. All local state (course name, slope, rating, players, pars). |
| **Mutation** | `createRound` Server Action on "GO" tap. |
| **Navigation** | On success → `/round/{roundId}` (Score Entry). |

### 4.4 Score Entry (`/round/[id]`)

The most complex screen. Fully client-side during active play.

| Aspect | Detail |
|---|---|
| **Rendering** | Client Component. |
| **Initial load** | Server Action or direct Drizzle query fetches the full round: round metadata + all players + all hole_data. Hydrates the Zustand store. |
| **During play** | All state lives in Zustand (memory) + localStorage (persist). No server reads during scoring. |
| **Writes** | `upsertHoleData` Server Action, debounced 2s after last input. Silent. Failures are swallowed — localStorage is the safety net. |
| **Completion** | `bulkUpsertHoleData` + `completeRound` Server Actions. Clears localStorage. Redirects to `/rounds/{id}` (Dashboard). |

**Zustand Store Shape:**
```typescript
interface ScoringStore {
  roundId: string;
  holeCount: number;
  pars: number[];
  players: { id: string; name: string }[];
  currentHole: number;        // 0-indexed
  activePlayer: number;       // index into players[]
  holesData: HoleData[][];    // [playerIndex][holeIndex]
  showMore: boolean;          // secondary fields expanded

  // Actions
  setScore: (score: number) => void;
  setPutts: (putts: number) => void;
  setFairway: (fw: Fairway) => void;
  setGIR: (gir: GIR) => void;
  setMissDirection: (dirs: MissDirection[]) => void;
  setPinPosition: (pin: PinPosition) => void;
  setPenalties: (n: number) => void;
  setClub: (club: string | null) => void;
  setUpAndDown: (val: boolean | null) => void;
  setSandSave: (val: boolean | null) => void;
  setNotes: (text: string) => void;
  goToHole: (index: number) => void;
  setActivePlayer: (index: number) => void;
  reset: () => void;
}
```

**localStorage persistence:**
```
Key: "birdie-scoring-{roundId}"
Value: JSON-serialized ScoringStore (minus actions)
TTL: Cleared on completeRound. Otherwise persists indefinitely.
```

### 4.5 Scorecard View (`/round/[id]/scorecard`)

| Aspect | Detail |
|---|---|
| **Rendering** | Client Component (reads from Zustand during active round) or Server Component (reads from Postgres for completed round). |
| **Data — active round** | Same Zustand store as Score Entry. Real-time as data is entered. |
| **Data — completed round** | Drizzle query: round + players + hole_data. Identical to initial Score Entry load. |
| **Interactions** | Tapping a score cell navigates to Score Entry for that hole. |

### 4.6 On-Course Stats (`/round/[id]/stats`)

| Aspect | Detail |
|---|---|
| **Rendering** | Client Component. |
| **Data** | Same Zustand store. Computed stats via `getRoundStats()` and `getClubStats()` pure functions. |
| **Visualizations** | Miss Map (SVG), Stat Summary cards, Club Performance table — all reuse dashboard components. |

### 4.7 Post-Round Dashboard (`/rounds/[id]`)

| Aspect | Detail |
|---|---|
| **Rendering** | Server Component. |
| **Primary query** | Full round with players and hole_data (same as scorecard). |
| **Stat computation** | `getRoundStats()` and `getClubStats()` applied server-side before rendering. |
| **Miss Map data** | Filtered from hole_data: all rows where `gir = 'miss'` and `girMissDirection` is non-empty. |
| **Export** | `exportRoundCSV` / `exportRoundJSON` — triggered client-side, generates a file download. |

**SQL for dashboard data:**
```sql
SELECT
  r.*,
  json_agg(
    json_build_object(
      'id', p.id,
      'name', p.name,
      'sortOrder', p.sort_order,
      'holes', (
        SELECT json_agg(hd.* ORDER BY hd.hole_number)
        FROM hole_data hd WHERE hd.player_id = p.id
      )
    ) ORDER BY p.sort_order
  ) as players
FROM rounds r
JOIN players p ON p.round_id = r.id
WHERE r.id = $1 AND r.user_id = $2
GROUP BY r.id;
```

### 4.8 Trends (`/trends`)

| Aspect | Detail |
|---|---|
| **Rendering** | Server Component (data) + Client Component (charts). |
| **Primary query** | All completed rounds for user, with per-round aggregate stats. |
| **Charts** | 5 line charts (Score, GIR%, Putts per GIR, FW%, Scrambling%) rendered with custom SVG. Data points = one per completed round. "Putts per GIR" = average putts on GIR-hit holes only (per PRD §3.6). |
| **Cumulative Miss Map** | Aggregates `girMissDirection` + `pinPosition` across ALL rounds. Single SQL query joining rounds → players → hole_data where `gir = 'miss'`. |

**SQL for trend data:**
```sql
SELECT
  r.id,
  r.date,
  r.course_name,
  r.pars,
  SUM(hd.score) as total_score,
  SUM(hd.putts) as total_putts,
  COUNT(hd.*) as holes_played,
  COUNT(CASE WHEN hd.gir = 'hit' THEN 1 END) as gir_hit,
  COUNT(CASE WHEN hd.gir IS NOT NULL THEN 1 END) as gir_total,
  COUNT(CASE WHEN hd.fairway = 'hit' THEN 1 END) as fw_hit,
  COUNT(CASE WHEN hd.fairway IS NOT NULL THEN 1 END) as fw_total,
  COUNT(CASE WHEN hd.gir = 'miss' AND hd.score <= (r.pars->>((hd.hole_number-1)::text))::int THEN 1 END) as scrambling_converted,
  COUNT(CASE WHEN hd.gir = 'miss' THEN 1 END) as scrambling_attempts,
  COUNT(CASE WHEN hd.fairway = 'hit' THEN 1 END) as fw_hit,
  COUNT(CASE WHEN hd.fairway IS NOT NULL THEN 1 END) as fw_total,
  AVG(CASE WHEN hd.gir = 'hit' THEN hd.putts END) as putts_per_gir
FROM rounds r
JOIN players p ON p.round_id = r.id AND p.sort_order = 0
JOIN hole_data hd ON hd.player_id = p.id AND hd.score IS NOT NULL
WHERE r.user_id = $1 AND r.status = 'completed'
GROUP BY r.id
ORDER BY r.date ASC;
```

**SQL for cumulative miss map:**
```sql
SELECT
  hd.gir_miss_direction,
  hd.pin_position
FROM hole_data hd
JOIN players p ON p.id = hd.player_id AND p.sort_order = 0
JOIN rounds r ON r.id = p.round_id
WHERE r.user_id = $1
  AND r.status = 'completed'
  AND hd.gir = 'miss'
  AND hd.gir_miss_direction IS NOT NULL;
```

---

## 5. Data Flow Diagrams

### 5.1 Scoring (On-Course) — Write Path

```
User taps stepper/toggle
  │
  ▼
Zustand store.setState()          ← Instant (memory)
  │
  ├──▶ localStorage.setItem()    ← Synchronous (crash recovery)
  │
  ├──▶ UI re-renders             ← Instant (React state)
  │
  └──▶ Debounce timer (2s)
        │
        ▼ (after 2s of inactivity)
       Server Action: upsertHoleData()
        │
        ├──▶ Postgres INSERT ... ON CONFLICT DO UPDATE
        │     │
        │     ├── Success: done (silent)
        │     └── Failure: swallow error, retry on next trigger
        │
        └──▶ Data safe in localStorage regardless
```

### 5.2 Round Completion — Write Path

```
User taps "Finish Round"
  │
  ▼
FinishRoundDialog renders
  │
  ▼ (user confirms)
Server Action: bulkUpsertHoleData()   ← Write all remaining holes
  │
  ▼
Server Action: completeRound()
  │
  ├──▶ UPDATE rounds SET status = 'completed'
  ├──▶ revalidatePath("/rounds")
  ├──▶ revalidatePath("/trends")
  │
  ▼
Clear localStorage for this round
  │
  ▼
router.push("/rounds/{id}")           ← Navigate to Dashboard
  │
  ▼
Haptic buzz (50ms)
```

### 5.3 Data Views — Read Path

```
User navigates to /rounds or /rounds/[id] or /trends
  │
  ▼
Next.js Server Component renders on server
  │
  ▼
Drizzle ORM query → Postgres
  │
  ▼
Pure function: getRoundStats() / getClubStats()
  │
  ▼
HTML streamed to client
  │
  ▼
No client-side fetch. No loading spinner. No stale data.
```

### 5.4 Crash Recovery

```
App crashes / tab closes / phone dies
  │
  ▼
User reopens app, navigates to /round/{id}
  │
  ▼
Zustand persist middleware:
  localStorage.getItem("birdie-scoring-{roundId}")
  │
  ├── Found: Hydrate store. Resume scoring at exact hole/player/data.
  │           Trigger bulkUpsertHoleData() to sync any unwritten data to Postgres.
  │
  └── Not found: Fetch from Postgres via Server Action.
                 (Possible if user cleared browser data.)
```

---

## 6. Caching Strategy

### 6.1 Principle

Birdie is a write-heavy app during scoring and a read-heavy app for review. The caching strategy reflects this asymmetry.

### 6.2 Server-Side (Next.js)

| Layer | Strategy | Notes |
|---|---|---|
| **Server Components** | Fresh on every request (no `cache: 'force-cache'`). | Data pages (history, dashboard, trends) always query Postgres directly. No stale data risk. Acceptable because queries are fast (indexed, small dataset per user). |
| **`revalidatePath`** | Called after every mutation (`createRound`, `completeRound`, `deleteRound`). | Ensures the Next.js router cache is invalidated for affected pages. The user sees fresh data immediately after any action. |
| **Static pages** | Landing page (`/`) is statically generated at build time. | No database dependency. Served from CDN. |
| **ISR** | Not used. | All data pages are per-user and mutation-driven. ISR's time-based revalidation doesn't fit. |

### 6.3 Client-Side

| Layer | Strategy | Notes |
|---|---|---|
| **Zustand (memory)** | Active scoring session only. No cache for read views. | Store exists only while scoring. Cleared on round completion. Not used for history/dashboard/trends. |
| **localStorage** | Crash recovery buffer for active round. | Written synchronously on every input. Cleared on `completeRound`. Not a read cache — only a write buffer. |
| **Browser HTTP cache** | Default Next.js behavior. | Server Component HTML is not cached aggressively. `revalidatePath` handles freshness. |
| **No SWR / React Query** | Deliberate. | Server Components eliminate the need for client-side data fetching libraries. No loading states, no stale-while-revalidate, no cache invalidation complexity. |

### 6.4 Database-Level

| Concern | Approach |
|---|---|
| **Connection pooling** | Single Drizzle client instance (`src/lib/db/index.ts`). In serverless (Vercel), use `@neondatabase/serverless` driver with connection pooling. In Docker, standard `pg` driver with a pool. |
| **Query performance** | Indexes on `(userId, date)`, `(userId, status)`, `(playerId, holeNumber)`. All dashboard/trend queries filter by `userId` first — small result sets. |
| **No query cache** | Not needed. Typical user has < 100 rounds. All queries return in < 50ms with indexes. |

---

## 7. Security Model

### 7.1 MVP (No Auth)

| Concern | Implementation |
|---|---|
| **Authentication** | None. No login. `userId = "local"` for all data. |
| **Authorization** | All data belongs to one implicit user. No row-level filtering needed. |
| **Data isolation** | Single-user system. If deployed locally (Docker), only accessible on `localhost`. If on Vercel, anyone with the URL can access all data. Acceptable for personal use. |
| **CSRF** | Server Actions have built-in CSRF protection (Next.js generates and validates tokens automatically). |
| **XSS** | React's JSX escaping prevents XSS by default. No `dangerouslySetInnerHTML` anywhere. User-entered text (course names, player names, notes) is always rendered via React, never injected as raw HTML. |
| **SQL injection** | Drizzle ORM parameterizes all queries. No raw SQL strings with user input. |
| **localStorage** | Contains scoring data only. No secrets, no tokens. Cleared after round completion. |

### 7.2 Post-MVP (Auth Enabled)

| Concern | Implementation |
|---|---|
| **Authentication** | Auth.js (NextAuth v5). Session-based with JWT or database sessions. |
| **Session management** | `auth()` server function returns the current session. `useSession()` client hook for UI state. |
| **Authorization — reads** | Every database query includes `WHERE userId = session.user.id`. No user can read another user's rounds. |
| **Authorization — writes** | Every Server Action verifies: (a) session exists, (b) the target round/player belongs to `session.user.id`. Returns 403 if not. |
| **Middleware** | `src/middleware.ts` protects routes: unauthenticated users are redirected to `/login`. Public routes: `/`, `/login`, `/register`. |
| **Password storage** | bcrypt with cost factor 12. Only for Credentials provider. |
| **OAuth** | Auth.js handles token exchange, refresh, and session binding. No custom OAuth code. |
| **Rate limiting** | Recommended: apply rate limiting to Server Actions (e.g., 60 calls/minute per user for `upsertHoleData`). Prevents abuse from compromised sessions. Implementation: middleware or edge function with a sliding window counter. |
| **Data export** | Export endpoints verify session and round ownership before generating files. |

### 7.3 Threat Model

| Threat | Mitigation |
|---|---|
| **Unauthorized data access** | Row-level filtering by `userId` on every query. Server Actions verify ownership. |
| **Session hijacking** | Auth.js uses HTTP-only, secure, SameSite cookies. JWT tokens are signed with `AUTH_SECRET`. |
| **Brute force login** | Rate limit `/api/auth/signin` endpoint. Account lockout after 10 failed attempts (post-MVP). |
| **Data loss** | Postgres is the source of truth with backup (`pg_dump` local, PITR on Neon). localStorage provides additional redundancy during active scoring. |
| **Offline tampering** | localStorage is not trusted as authoritative. On conflict, Postgres wins. The client sends data; the server validates and stores it. |
| **Malicious input** | All input is typed (TypeScript) and parameterized (Drizzle). No eval, no raw SQL, no innerHTML. Notes field is freeform text but always rendered safely by React. |

---

## 8. Auth Endpoints (Implemented Last)

Auth is added post-MVP. The app ships and works fully without it. This section documents what gets added when auth is wired in.

### 8.1 Auth Configuration

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";        // Optional
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        return valid ? { id: user.id, email: user.email, name: user.name } : null;
      },
    }),
    // Uncomment for OAuth:
    // Google,
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
});
```

### 8.2 Auth API Route

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

This single route handles all Auth.js flows: sign in, sign out, session refresh, OAuth callbacks.

### 8.3 Route Protection Middleware

```typescript
// src/middleware.ts
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/rounds/:path*",
    "/trends/:path*",
    "/round/:path*",
    "/new-round",
  ],
};
```

Public routes (`/`, `/login`, `/register`) are excluded from the matcher.

### 8.4 Auth Pages

#### Login (`/login`)

| Aspect | Detail |
|---|---|
| **Fields** | Email, Password |
| **Actions** | `signIn("credentials", { email, password })` |
| **Error states** | "Invalid email or password" (generic, no enumeration) |
| **OAuth** | "Sign in with Google" button (if configured) |
| **Link** | "Don't have an account? Register" → `/register` |

#### Register (`/register`)

| Aspect | Detail |
|---|---|
| **Fields** | Name, Email, Password, Confirm Password |
| **Validation** | Email format, password min 8 chars, passwords match |
| **Server Action** | `registerUser(name, email, password)` |
| **Logic** | Check email uniqueness → bcrypt hash password → `INSERT INTO users` → auto sign in → redirect to `/rounds` |
| **Error states** | "Email already registered" |

### 8.5 Auth Server Actions

#### `registerUser`

```
File: src/actions/auth.ts
```

| Parameter | Type |
|---|---|
| name | `string` |
| email | `string` |
| password | `string` |

**Logic:**
1. Validate email format and password length (≥ 8 chars).
2. Check `users` table for existing email. Return error if exists.
3. Hash password: `bcrypt.hash(password, 12)`.
4. `INSERT INTO users (name, email, passwordHash)`.
5. Call `signIn("credentials", { email, password })`.
6. Return `{ success: true }`.

#### `migrateLocalData`

One-time action when a user who was using the app without auth creates an account. Transfers all `userId = "local"` data to their new user ID.

```
File: src/actions/auth.ts
Trigger: After first successful login/registration, if local data exists.
```

| Parameter | Type |
|---|---|
| newUserId | `string` |

**Logic:**
1. `UPDATE rounds SET userId = $newUserId WHERE userId = 'local'`.
2. This transfers all existing rounds (and their cascade-linked players/holes) to the new account.
3. Idempotent — safe to call multiple times.

### 8.6 Session Access Pattern

The app uses a single pattern everywhere to get the current user:

```typescript
// In Server Components and Server Actions
import { auth } from "@/lib/auth";

const session = await auth();
const userId = session?.user?.id ?? "local";
```

When auth is not configured (MVP), `auth()` returns a synthetic session with `userId = "local"`. When auth is configured, it returns the real session. **Application code does not change** — only the auth config file changes.

```typescript
// In Client Components
import { useSession } from "next-auth/react";

const { data: session } = useSession();
// session is null when auth isn't configured — handle gracefully
```

---

## 9. Environment Variables

| Variable | MVP Local | MVP Cloud | Post-MVP Local | Post-MVP Cloud |
|---|---|---|---|---|
| `DATABASE_URL` | `postgresql://birdie:birdie@localhost:5432/birdie` | Neon connection string | Same | Same |
| `AUTH_SECRET` | — | — | Random 32-char string | Random 32-char string |
| `AUTH_GOOGLE_ID` | — | — | — | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | — | — | — | Google OAuth client secret |
| `NEXTAUTH_URL` | — | — | `http://localhost:3000` | `https://birdie.vercel.app` |

---

## 10. Migration Plan

### 10.1 MVP → Post-MVP (Adding Auth)

This is designed to be a zero-downtime, additive migration:

1. **Add auth tables** to Drizzle schema (`users`, `accounts`, `sessions`, `verification_tokens`).
2. **Run `drizzle-kit push`** to create the new tables. Existing tables are untouched.
3. **Swap `src/lib/auth.ts`** from the no-auth config to the Credentials config.
4. **Add `/login` and `/register` pages.**
5. **Add `src/middleware.ts`** for route protection.
6. **Set `AUTH_SECRET` env var.**
7. **Deploy.** Existing `userId = "local"` data continues to work. New users get real IDs.
8. **Call `migrateLocalData`** after first login to transfer local data to the new account.

No existing round data is lost. No schema changes to `rounds`, `players`, or `hole_data`. The only change is that `userId` starts containing real user IDs instead of `"local"`.

---

_Data designed for golfers. Architecture designed for simplicity._
