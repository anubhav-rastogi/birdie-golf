# Birdie — Implementation Plan

_From mock data to real app in six phases._

_Last updated: February 11, 2026_

---

## Current State

The entire frontend is built and running at `localhost:3000` with mock data. 38 source files across 8 pages, 14 components, and 4 utility modules. Every screen is reachable, animated, and interactive. The app has a command palette, keyboard shortcuts, dark/light theme, haptics, and toast notifications.

**What's fake:** All data comes from `src/lib/mock-data.ts`. No database. No persistence. No Server Actions. Scoring state lives in React `useState` — it's lost on page refresh.

**What needs to be real:** Postgres, Drizzle ORM, Server Actions, Zustand + localStorage persistence, data export, and (finally) auth.

---

## Rules

1. **Each phase takes 30–45 minutes** for a focused developer.
2. **The app is working after every phase.** You can run `pnpm dev` and use it. No broken intermediate states.
3. **`userId = "local"` until Phase 6.** No login, no registration, no session management until the final phase.
4. **Every phase includes tests.** Unit tests (Vitest) for logic, integration tests for Server Actions, E2E tests (Playwright) for critical flows.
5. **Phases are sequential.** Each builds on the last. No skipping.

---

## Phase 1 — Database Foundation

_Set up Postgres, Drizzle schema, and the connection layer. The app still runs on mock data — nothing changes visually._

**Time: ~30 min**

### Steps

1. **Install dependencies**
   ```bash
   pnpm add drizzle-orm postgres
   pnpm add -D drizzle-kit @types/pg
   ```

2. **Create `docker-compose.yml`** at the project root
   ```yaml
   services:
     db:
       image: postgres:16-alpine
       environment:
         POSTGRES_DB: birdie
         POSTGRES_USER: birdie
         POSTGRES_PASSWORD: birdie
       volumes:
         - birdie_data:/var/lib/postgresql/data
       ports:
         - "5432:5432"
   volumes:
     birdie_data:
   ```

3. **Create `.env.local`**
   ```
   DATABASE_URL=postgresql://birdie:birdie@localhost:5432/birdie
   ```

4. **Create `drizzle.config.ts`**
   ```typescript
   import { defineConfig } from "drizzle-kit";

   export default defineConfig({
     schema: "./src/lib/db/schema.ts",
     out: "./src/lib/db/migrations",
     dialect: "postgresql",
     dbCredentials: {
       url: process.env.DATABASE_URL!,
     },
   });
   ```

5. **Create `src/lib/db/schema.ts`** — the Drizzle schema from `docs/system-design.md` §2.1. Three tables: `rounds`, `players`, `holeData`. Four enums: `roundStatus`, `fairway`, `gir`, `pinPosition`. Unique index on `(playerId, holeNumber)`.

6. **Create `src/lib/db/index.ts`** — Drizzle client
   ```typescript
   import { drizzle } from "drizzle-orm/postgres-js";
   import postgres from "postgres";
   import * as schema from "./schema";

   const client = postgres(process.env.DATABASE_URL!);
   export const db = drizzle(client, { schema });
   ```

7. **Start Postgres and push schema**
   ```bash
   docker compose up -d
   pnpm drizzle-kit push
   ```

8. **Create `src/lib/db/types.ts`** — extract shared TypeScript interfaces (`RoundSummary`, `HoleData`, `DetailedRound`, `RoundStats`, `ClubStat`, `TrendPoint`) from `src/lib/mock-data.ts` into a standalone types file. Both mock-data and future DB queries import from here.

### Tests

- **`src/lib/db/__tests__/connection.test.ts`** (Vitest) — verify `db` connects, runs a raw `SELECT 1`, and disconnects.
- **`src/lib/db/__tests__/schema.test.ts`** (Vitest) — insert a round, a player, and a hole_data row. Read them back. Delete the round (verify cascade deletes player and hole_data). Verify unique constraint on `(playerId, holeNumber)`.

### Verification

```bash
pnpm dev          # App still works with mock data — no changes to any page
docker compose ps # Postgres is running
pnpm vitest run   # Schema tests pass
```

### Files Created/Modified

| File | Action |
|---|---|
| `docker-compose.yml` | Created |
| `.env.local` | Created |
| `drizzle.config.ts` | Created |
| `src/lib/db/schema.ts` | Created |
| `src/lib/db/index.ts` | Created |
| `src/lib/db/types.ts` | Created |
| `src/lib/mock-data.ts` | Modified — imports types from `db/types.ts` |
| `src/lib/db/__tests__/connection.test.ts` | Created |
| `src/lib/db/__tests__/schema.test.ts` | Created |

---

## Phase 2 — Server Actions (Write Path)

_All mutations go through Server Actions. They're testable independently — no UI changes yet._

**Time: ~40 min**

### Steps

1. **Install Vitest** (if not already present)
   ```bash
   pnpm add -D vitest @vitejs/plugin-react
   ```

2. **Create `src/actions/rounds.ts`** — three Server Actions:

   - **`createRound(input)`** — validates input, checks no active round exists for `userId = "local"`, inserts into `rounds`, `players`, and pre-creates `hole_data` rows (one per player per hole). Returns `{ roundId, players }`.
   - **`completeRound(roundId)`** — verifies round is active and belongs to `"local"`, sets `status = "completed"`, calls `revalidatePath("/rounds")` and `revalidatePath("/trends")`.
   - **`deleteRound(roundId)`** — verifies ownership, `DELETE FROM rounds WHERE id = roundId` (cascade), revalidates.
   - **`fetchRound(roundId)`** — fetches full round with players and hole data. Used by Score Entry (Client Component) to hydrate Zustand when localStorage is empty. Calls `getRoundWithHoles(roundId, "local")`. Returns round object or `null`.

3. **Create `src/actions/scoring.ts`** — two Server Actions:

   - **`upsertHoleData(playerId, holeNumber, data)`** — `INSERT ... ON CONFLICT (player_id, hole_number) DO UPDATE`. Updates `rounds.updatedAt` on the parent round. Returns `{ success: true }`.
   - **`bulkUpsertHoleData(roundId, holes[])`** — wraps multiple upserts in a single transaction. Used for round completion sync.

4. **Create `src/actions/export.ts`** — two pure functions (not Server Actions — they generate strings client-side):

   - **`generateCSV(round, players, holes)`** — returns CSV string.
   - **`generateJSON(round, players, holes)`** — returns JSON string.

5. **Create `src/lib/db/queries.ts`** — read functions (called from Server Components):

   - **`getRoundHistory(userId)`** — returns all rounds with summary stats. The SQL from `docs/system-design.md` §4.2.
   - **`getRoundWithHoles(roundId, userId)`** — returns full round with nested players and hole data.
   - **`getTrendData(userId)`** — returns per-round aggregates for completed rounds, including `puttsPerGIR` (average putts on GIR-hit holes), `fwPercent`, and `scramblingPercent`.
   - **`getCumulativeMisses(userId)`** — returns all GIR miss data across rounds.

### Tests

- **`src/actions/__tests__/rounds.test.ts`** (Vitest) — test `createRound` creates a round with players and empty holes. Test `completeRound` changes status. Test `deleteRound` cascades. Test that creating a second active round fails. Test `fetchRound` returns full round with nested players and holes, and returns `null` for wrong userId.
- **`src/actions/__tests__/scoring.test.ts`** (Vitest) — test `upsertHoleData` creates and updates. Test unique constraint. Test `bulkUpsertHoleData` writes multiple holes atomically.
- **`src/lib/db/__tests__/queries.test.ts`** (Vitest) — seed 3 rounds with hole data, test `getRoundHistory` returns correct summary stats, test `getTrendData` returns correct aggregates.

### Verification

```bash
pnpm vitest run   # All Server Action tests pass
pnpm dev          # App still works with mock data
```

### Files Created/Modified

| File | Action |
|---|---|
| `src/actions/rounds.ts` | Created — includes `createRound`, `completeRound`, `deleteRound`, `fetchRound` |
| `src/actions/scoring.ts` | Created |
| `src/actions/export.ts` | Created |
| `src/lib/db/queries.ts` | Created |
| `src/actions/__tests__/rounds.test.ts` | Created |
| `src/actions/__tests__/scoring.test.ts` | Created |
| `src/lib/db/__tests__/queries.test.ts` | Created |
| `vitest.config.ts` | Created (if needed) |

---

## Phase 3 — Zustand Store + Scoring Flow

_The core loop becomes real. Score Entry, Scorecard, and On-Course Stats use Zustand with localStorage persistence. New Round creates a real round in Postgres. Finish Round writes to Postgres._

**Time: ~40 min**

### Steps

1. **Install Zustand**
   ```bash
   pnpm add zustand
   ```

2. **Create `src/stores/scoring-store.ts`** — the Zustand store with `persist` middleware:
   - State: `roundId`, `holeCount`, `pars`, `players`, `currentHole`, `activePlayer`, `holesData[][]`, `showMore`, `dirty` flag.
   - Actions: `setScore`, `setPutts`, `setFairway`, `setGIR`, `setMissDirection`, `setPinPosition`, `setPenalties`, `setClub`, `setUpAndDown`, `setSandSave`, `setNotes`, `goToHole`, `setActivePlayer`, `hydrate(round)`, `reset`.
   - Persist config: `name: "birdie-scoring"`, `storage: localStorage`, `partialize` to exclude actions.
   - Debounced save: every state change triggers a 2-second debounced call to `upsertHoleData`.

3. **Wire New Round Setup page** (`src/app/(app)/new-round/page.tsx`):
   - "GO" button calls `createRound` Server Action.
   - On success, `router.push(`/round/${roundId}`)`.
   - The created round is `"active"` in Postgres.

4. **Wire Score Entry page** (`src/app/(scoring)/round/[id]/page.tsx`):
   - On mount: if Zustand store has data for this `roundId`, use it (crash recovery). Otherwise, call `fetchRound(roundId)` Server Action (from Phase 2) to load from Postgres and hydrate the store.
   - Replace all `useState` calls with Zustand selectors.
   - Every input change updates the store → localStorage (instant) → debounced Server Action (2s).

5. **Wire Scorecard page** — reads from Zustand store (active round) or fetches from Postgres (completed round).

6. **Wire On-Course Stats page** — reads from Zustand store.

7. **Wire Finish Round dialog**:
   - Calls `bulkUpsertHoleData` to flush all data.
   - Calls `completeRound`.
   - Clears the Zustand store (`reset()`).
   - `router.push(`/rounds/${roundId}`)`.

8. **Wire Leave Round flow** — "Leave" returns to `/rounds`. Round stays active. Active round banner on home page links back.

### Tests

- **`src/stores/__tests__/scoring-store.test.ts`** (Vitest) — test hydration from mock round. Test that `setScore` updates `holesData`. Test that GIR auto-derivation works. Test `reset` clears state.
- **Playwright `tests/scoring-flow.spec.ts`** — navigate to `/new-round`, fill form, tap GO, verify redirect to Score Entry. Enter score for hole 1. Navigate to hole 2. Refresh page — verify data is restored from localStorage.

### Verification

```bash
pnpm vitest run                  # Store tests pass
pnpm playwright test             # E2E scoring flow passes
pnpm dev                         # Create a round, score holes — data persists on refresh
```

### Files Created/Modified

| File | Action |
|---|---|
| `src/stores/scoring-store.ts` | Created |
| `src/app/(app)/new-round/page.tsx` | Modified — calls `createRound` |
| `src/app/(scoring)/round/[id]/page.tsx` | Modified — uses Zustand store |
| `src/app/(scoring)/round/[id]/scorecard/page.tsx` | Modified — reads from store or Postgres |
| `src/app/(scoring)/round/[id]/stats/page.tsx` | Modified — reads from store |
| `src/components/scoring/finish-round-dialog.tsx` | Modified — calls Server Actions |
| `src/stores/__tests__/scoring-store.test.ts` | Created |
| `tests/scoring-flow.spec.ts` | Created |

---

## Phase 4 — Read Screens (Off-Course)

_Round History, Post-Round Dashboard, and Trends read from Postgres. Mock data is removed._

**Time: ~35 min**

### Steps

1. **Wire Round History page** (`src/app/(app)/rounds/page.tsx`):
   - Convert to Server Component (remove `"use client"`).
   - Call `getRoundHistory("local")`.
   - Map DB results to `RoundSummary[]` and pass to `<RoundList>`.
   - Active round check: if an active round exists, show the banner.

2. **Wire Post-Round Dashboard page** (`src/app/(app)/rounds/[id]/page.tsx`):
   - Already a Server Component.
   - Call `getRoundWithHoles(id, "local")`.
   - Compute `getRoundStats()` and `getClubStats()` from the fetched data.
   - Pass to existing components (`StatSummary`, `MissMap`, `ClubTable`).

3. **Wire Trends page** (`src/app/(app)/trends/page.tsx`):
   - Convert to Server Component (data fetching part).
   - Call `getTrendData("local")` and `getCumulativeMisses("local")`.
   - Pass data to client-side chart components (`MiniChart`, `MissMap`).

4. **Wire Delete Round** — add swipe-to-delete or a delete button on round cards. Calls `deleteRound` Server Action.

5. **Wire Export buttons** on Post-Round Dashboard — `generateCSV` and `generateJSON` create a Blob and trigger a download.

6. **Remove mock data dependency** from all pages. The `src/lib/mock-data.ts` file can remain for reference/seeding but is no longer imported by any page or component.

### Tests

- **Playwright `tests/round-history.spec.ts`** — seed 2 rounds via `createRound` + `bulkUpsertHoleData` + `completeRound`. Navigate to `/rounds`. Verify both rounds appear. Tap one — verify dashboard shows correct stats.
- **Playwright `tests/trends.spec.ts`** — with 2+ seeded rounds, navigate to `/trends`. Verify all 5 charts render (Score, GIR%, Putts per GIR, FW%, Scrambling%). Verify miss map shows dots.
- **Playwright `tests/full-flow.spec.ts`** — complete end-to-end: create round → score 18 holes → finish → verify dashboard → verify round in history → verify trends updated.

### Verification

```bash
pnpm playwright test          # All E2E tests pass
pnpm dev                      # Full app works with real Postgres data
# Delete all rounds — verify empty states render correctly
# Create a new round — verify it appears in history
```

### Files Created/Modified

| File | Action |
|---|---|
| `src/app/(app)/rounds/page.tsx` | Modified — Server Component with Drizzle query |
| `src/app/(app)/rounds/[id]/page.tsx` | Modified — fetches from Postgres |
| `src/app/(app)/trends/page.tsx` | Modified — fetches from Postgres |
| `src/components/round-list.tsx` | Modified — delete round support |
| `src/app/(app)/rounds/[id]/export-buttons.tsx` | Created — CSV/JSON download |
| `tests/round-history.spec.ts` | Created |
| `tests/trends.spec.ts` | Created |
| `tests/full-flow.spec.ts` | Created |

---

## Phase 5 — Error Handling, Offline, and Polish

_Tie up every loose end. The app should be indistinguishable from "shipped."_

**Time: ~30 min**

### Steps

1. **Error handling for Server Action failures**:
   - In `upsertHoleData`: wrap in try/catch. On failure, do nothing (silent — data is in localStorage). Log to console in dev.
   - In `completeRound`: if the bulk write fails, show a toast: "Couldn't save to database. Your round is saved locally and will sync when the connection is restored." Retry on next attempt.
   - In `createRound`: if it fails, show a toast and stay on the New Round page.

2. **Sync indicator** (optional, subtle):
   - A tiny dot in the running totals bar: green when last sync succeeded, amber when data is dirty (not yet written). No text — just a visual cue.

3. **Empty states with real data**:
   - Round History: 0 rounds → empty state with "Start Your First Round" CTA.
   - Trends: 0–1 rounds → "Play a few more rounds to see trends."
   - Dashboard: all GIR hit → "All greens in regulation!" miss map state.
   - Club table: no club data → section hidden.

4. **Seed script** (`scripts/seed.ts`):
   - Creates 5 completed rounds with realistic hole data (reuse the mock data structure).
   - Useful for development and demos.
   - Run with: `pnpm tsx scripts/seed.ts`.

5. **Clean up**:
   - Remove any remaining `import ... from "@/lib/mock-data"` from pages.
   - Keep `mock-data.ts` only if the seed script references it, otherwise delete.
   - Verify `pnpm build` succeeds with zero warnings.

### Tests

- **`src/actions/__tests__/error-handling.test.ts`** (Vitest) — test that `upsertHoleData` returns gracefully when the database is unreachable. Test that `completeRound` returns an error object (not throws) when the write fails.
- **Playwright `tests/empty-states.spec.ts`** — start with a clean database. Navigate to `/rounds` → verify empty state. Navigate to `/trends` → verify "play more rounds" message.

### Verification

```bash
pnpm build                    # Zero errors, zero warnings
pnpm vitest run               # All tests pass
pnpm playwright test          # All E2E tests pass
# Stop Postgres, try scoring — verify data is retained in localStorage
# Restart Postgres — verify data syncs
```

### Files Created/Modified

| File | Action |
|---|---|
| `src/actions/rounds.ts` | Modified — error handling |
| `src/actions/scoring.ts` | Modified — error handling |
| `scripts/seed.ts` | Created |
| `src/actions/__tests__/error-handling.test.ts` | Created |
| `tests/empty-states.spec.ts` | Created |
| Various page files | Minor tweaks for empty states |

---

## Phase 6 — Auth & Onboarding (Final)

_The only phase that touches auth. Everything before this runs as `userId = "local"` with no login. This phase provides two options._

**Time: ~45 min**

### Prerequisites

```bash
pnpm add next-auth@5 @auth/drizzle-adapter bcryptjs
pnpm add -D @types/bcryptjs
```

### Shared Steps (Both Options)

1. **Add auth tables to schema** (`src/lib/db/schema.ts`):
   - `users`, `accounts`, `sessions`, `verificationTokens` — from `docs/system-design.md` §2.3.
   - Run `pnpm drizzle-kit push`.

2. **Create `src/lib/auth.ts`** — Auth.js configuration (differs by option — see below).

3. **Create `src/app/api/auth/[...nextauth]/route.ts`**:
   ```typescript
   import { handlers } from "@/lib/auth";
   export const { GET, POST } = handlers;
   ```

4. **Create `/login` page** (`src/app/(auth)/login/page.tsx`):
   - Email + password form.
   - Calls `signIn("credentials", { email, password, redirectTo: "/rounds" })`.
   - Error state: "Invalid email or password."
   - Link to `/register`.
   - Styled in the Birdie palette. Full-screen centered form on `bg-forest`.

5. **Create `/register` page** (`src/app/(auth)/register/page.tsx`):
   - Name, email, password, confirm password.
   - Client-side validation: email format, password ≥ 8 chars, passwords match.
   - Calls `registerUser` Server Action.
   - Link to `/login`.

6. **Create `src/actions/auth.ts`**:
   - **`registerUser(name, email, password)`** — validate, check uniqueness, bcrypt hash, insert user, auto sign in.
   - **`migrateLocalData(newUserId)`** — `UPDATE rounds SET userId = $newUserId WHERE userId = 'local'`. Called after first login if local data exists.

7. **Create `src/middleware.ts`** — protect app routes:
   ```typescript
   export { auth as middleware } from "@/lib/auth";
   export const config = {
     matcher: ["/rounds/:path*", "/trends/:path*", "/round/:path*", "/new-round"],
   };
   ```

8. **Update all Server Actions and queries** — replace hardcoded `"local"` with `session.user.id`:
   ```typescript
   const session = await auth();
   const userId = session?.user?.id ?? "local";
   ```

9. **Update the app shell** — show user name / sign-out button in sidebar and top bar when authenticated.

10. **Local data migration prompt**: on first login, check if any rounds exist with `userId = "local"`. If yes, show a dialog: "Transfer your existing rounds to this account?" → calls `migrateLocalData`.

### Option A — Local Auth (Credentials Only)

For self-hosted / Docker deployments. No external services.

**`src/lib/auth.ts`:**
```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";
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
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        return valid ? { id: user.id, email: user.email, name: user.name } : null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
});
```

**Env vars:**
```
AUTH_SECRET=<openssl rand -base64 32>
```

**No OAuth. No external API keys. Fully self-contained.**

### Option B — Cloud Auth (Credentials + Google OAuth)

For Vercel + Neon deployments. Adds social login.

**`src/lib/auth.ts`:**
```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({ /* same as Option A */ }),
    Google,
  ],
  session: { strategy: "database" },
  pages: { signIn: "/login" },
});
```

**Env vars:**
```
AUTH_SECRET=<openssl rand -base64 32>
AUTH_GOOGLE_ID=<google-client-id>
AUTH_GOOGLE_SECRET=<google-client-secret>
```

**Login page additions:** "Sign in with Google" button using `signIn("google")`.

### Tests

- **`src/actions/__tests__/auth.test.ts`** (Vitest) — test `registerUser` creates a user with hashed password. Test duplicate email rejection. Test `migrateLocalData` transfers rounds.
- **Playwright `tests/auth-flow.spec.ts`**:
  1. Navigate to `/rounds` → redirected to `/login`.
  2. Click "Register" → fill form → submit → redirected to `/rounds`.
  3. Create a round, score a hole, finish.
  4. Sign out → redirected to `/login`.
  5. Sign back in → round is there.
- **Playwright `tests/data-migration.spec.ts`**:
  1. (With auth disabled) create a round as `"local"` user.
  2. Enable auth. Register a new user.
  3. Verify migration prompt appears.
  4. Confirm → verify round now belongs to the new user.

### Verification

```bash
pnpm build                    # Zero errors
pnpm vitest run               # All tests pass
pnpm playwright test          # Full auth flow passes
# Test: unauthenticated access to /rounds → redirects to /login
# Test: register → login → score → sign out → sign in → data persists
```

### Files Created/Modified

| File | Action |
|---|---|
| `src/lib/db/schema.ts` | Modified — add auth tables |
| `src/lib/auth.ts` | Created |
| `src/app/api/auth/[...nextauth]/route.ts` | Created |
| `src/app/(auth)/login/page.tsx` | Created |
| `src/app/(auth)/register/page.tsx` | Created |
| `src/app/(auth)/layout.tsx` | Created (minimal layout, no sidebar) |
| `src/actions/auth.ts` | Created |
| `src/middleware.ts` | Created |
| `src/actions/rounds.ts` | Modified — session-based userId |
| `src/actions/scoring.ts` | Modified — session-based userId |
| `src/lib/db/queries.ts` | Modified — session-based userId |
| `src/components/app-shell/sidebar.tsx` | Modified — user info + sign out |
| `src/components/app-shell/top-bar.tsx` | Modified — user info + sign out |
| `src/actions/__tests__/auth.test.ts` | Created |
| `tests/auth-flow.spec.ts` | Created |
| `tests/data-migration.spec.ts` | Created |

---

## Phase Summary

| Phase | Duration | What becomes real | App state after |
|---|---|---|---|
| **1. Database** | 30 min | Postgres running, schema pushed, connection verified | App works on mock data. DB is ready but unused. |
| **2. Server Actions** | 40 min | All write operations exist and are tested | App works on mock data. Writes are testable but not wired to UI. |
| **3. Scoring Flow** | 40 min | Zustand store, localStorage persist, New Round → Score → Finish | Scoring is fully real. Create rounds, enter data, finish. Data persists. |
| **4. Read Screens** | 35 min | History, Dashboard, Trends read from Postgres | All screens show real data. Mock data removed. |
| **5. Polish** | 30 min | Error handling, offline, empty states, seed script | Production-quality. Handles edge cases. |
| **6. Auth** | 45 min | Login, register, session management, data migration | Multi-user. Two deployment options. |

**Total: ~3.5 hours** to go from "pretty mockup" to "shipped product."

---

## Dependency Installation Summary

| Phase | Packages |
|---|---|
| 1 | `drizzle-orm`, `postgres`, `drizzle-kit` (dev), `@types/pg` (dev) |
| 2 | `vitest` (dev), `@vitejs/plugin-react` (dev) |
| 3 | `zustand` |
| 4 | `playwright` (dev) — if not already installed |
| 5 | — (no new deps) |
| 6 | `next-auth@5`, `@auth/drizzle-adapter`, `bcryptjs`, `@types/bcryptjs` (dev) |

---

## Test Matrix

| Test file | Type | Phase | What it validates |
|---|---|---|---|
| `src/lib/db/__tests__/connection.test.ts` | Unit (Vitest) | 1 | Postgres connection works |
| `src/lib/db/__tests__/schema.test.ts` | Unit (Vitest) | 1 | Tables exist, constraints work, cascade deletes work |
| `src/actions/__tests__/rounds.test.ts` | Integration (Vitest) | 2 | createRound, completeRound, deleteRound, fetchRound |
| `src/actions/__tests__/scoring.test.ts` | Integration (Vitest) | 2 | upsertHoleData, bulkUpsertHoleData |
| `src/lib/db/__tests__/queries.test.ts` | Integration (Vitest) | 2 | getRoundHistory, getTrendData, aggregation accuracy |
| `src/stores/__tests__/scoring-store.test.ts` | Unit (Vitest) | 3 | Zustand store hydration, state updates, GIR auto-derivation |
| `tests/scoring-flow.spec.ts` | E2E (Playwright) | 3 | Create round → score → refresh → data persists |
| `tests/round-history.spec.ts` | E2E (Playwright) | 4 | Rounds appear in history, dashboard shows correct stats |
| `tests/trends.spec.ts` | E2E (Playwright) | 4 | Charts render with real data |
| `tests/full-flow.spec.ts` | E2E (Playwright) | 4 | End-to-end: create → score 18 → finish → dashboard → history → trends |
| `src/actions/__tests__/error-handling.test.ts` | Unit (Vitest) | 5 | Graceful failures when DB is down |
| `tests/empty-states.spec.ts` | E2E (Playwright) | 5 | Correct empty states on clean database |
| `src/actions/__tests__/auth.test.ts` | Integration (Vitest) | 6 | Register, login, data migration |
| `tests/auth-flow.spec.ts` | E2E (Playwright) | 6 | Register → login → use app → logout → login |
| `tests/data-migration.spec.ts` | E2E (Playwright) | 6 | Local data transfers to authenticated user |

---

_Six phases. Always working. Auth is last._
