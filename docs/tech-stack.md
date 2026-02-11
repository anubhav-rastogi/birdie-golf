# Birdie — Tech Stack

_One tool per layer. No hedging._

_Last updated: February 11, 2026_

---

## 1. Stack Overview

| Layer | Tool | Version |
|---|---|---|
| Language | **TypeScript** (strict mode) | 5.x |
| Framework | **Next.js** (App Router) | 16.x |
| Styling | **Tailwind CSS** | 4.x |
| Components | **shadcn/ui** (Radix under the hood) | latest |
| Charts | **Custom SVG** (hand-built line charts + miss map) | — |
| Database | **PostgreSQL** | 16 |
| ORM | **Drizzle ORM** | latest |
| Auth | **Auth.js** (NextAuth v5) — added last | 5.x |
| State | **Zustand** + `localStorage` | 5.x |
| Linting | **ESLint** + **Prettier** | — |
| Testing | **Vitest** + **Playwright** | — |
| Package Manager | **pnpm** | 9.x |

---

## 2. Why Each Choice

### Next.js 16 (App Router)

Framework, build tool, router, and server runtime in one. Server Components fetch round history, trends, and dashboards directly from Postgres — no loading spinners, no client-side data fetching. Client Components handle the interactive scoring loop. Server Actions handle mutations (create round, save hole data) without a separate API layer. Turbopack for dev, automatic code-splitting in prod.

### PostgreSQL 16

Source of truth for all round data. Relational structure maps directly to `rounds → players → hole_data` — tables with foreign keys, not documents. The queries that power dashboards and trends run natively in SQL: "GIR miss direction grouped by pin position across my last 20 rounds" is one query, not a client-side reduce over raw data.

### Drizzle ORM

Type-safe database access that stays close to SQL. The `HoleData` type with its 11 fields, unions, and optionals is defined once in the Drizzle schema and inferred everywhere — no duplicate type definitions. Migrations are auto-generated from schema diffs via `drizzle-kit`. No generated client binary (unlike Prisma), no runtime overhead. Works in standard Node and serverless environments.

### Tailwind CSS 4

Utility-first CSS for building the custom golf components (score stepper, miss direction diamond, scorecard grid) that no component library provides. v4's CSS-first config eliminates `tailwind.config.ts` boilerplate. The five-color palette (Black Forest, Olive Leaf, Cornsilk, Sunlit Clay, Copperwood) is defined as CSS custom properties in `globals.css` and extended into Tailwind as `bg-forest`, `text-cornsilk`, `accent-clay`, etc.

```css
/* src/styles/globals.css */
@theme {
  --color-forest: #283618;
  --color-olive: #606C38;
  --color-cornsilk: #FEFAE0;
  --color-clay: #DDA15E;
  --color-copper: #BC6C25;
}
```

### shadcn/ui

Not a dependency — a collection of copy-paste components built on Radix accessibility primitives. We get toggle groups, dialogs, sheets, and buttons that are accessible and keyboard-navigable out of the box, styled with Tailwind. The golf-specific components (stepper, fairway toggle, miss diamond) are all custom. shadcn handles the generic UI shell.

### Custom SVG Charts

All charts (trend lines and the miss-pattern green oval) are hand-built SVG components. This avoids a Recharts dependency (~200KB gzipped) for what are simple line charts with 5–20 data points. The `MiniChart` component handles responsive line rendering with axes, tooltips, and data points. The `MissMap` component renders the green-oval miss-pattern visualization. Both use Tailwind color tokens directly in SVG attributes.

### Auth.js (NextAuth v5)

The standard auth solution for Next.js. Session management, middleware-based route protection, pluggable providers. The same `auth()` server function and `useSession()` client hook work regardless of whether the backend is a simple credentials provider or OAuth.

**Added last.** The entire MVP ships without auth. Auth.js is wired in post-MVP with zero changes to scoring logic. See §5 for the full implementation plan.

### Zustand + localStorage

Zustand manages the **active scoring session** on the client: current hole index, active player, and in-progress hole data. Zustand's built-in `persist` middleware writes state to `localStorage` on every change — this is the auto-save mechanism. If the browser tab closes, the phone dies, or the app crashes mid-round, the scoring state survives in `localStorage` and is restored on next open.

Why `localStorage` over IndexedDB?

- **Simpler.** No extra dependency (Dexie), no async API, no schema. Zustand's persist middleware supports localStorage out of the box.
- **Sufficient.** A full 18-hole round with 4 players and all fields is ~5KB of JSON. `localStorage` holds 5–10MB. That's hundreds of rounds of buffer space — far more than needed for in-progress scoring.
- **Synchronous.** Reads are instant. No async/await dance for restoring state on page load.

`localStorage` is the **crash recovery and offline buffer** for the active round. Postgres is the **permanent store** for completed rounds. The flow:

```
During scoring:
  Tap → Zustand (memory) → localStorage (persist, instant)

On hole completion / round save:
  Zustand state → Server Action → Postgres
  On success: clear localStorage entry for that round

If server call fails (offline/error):
  Data safe in localStorage → retry on next save or page load
```

---

## 3. Deployment Path A: Fully Local (No Cloud Accounts)

Zero external accounts. Everything runs on your machine.

### MVP (Day 1)

```bash
# Start Postgres
docker run -d --name birdie-db \
  -e POSTGRES_DB=birdie \
  -e POSTGRES_USER=birdie \
  -e POSTGRES_PASSWORD=birdie \
  -p 5432:5432 \
  postgres:16-alpine

# Install deps + run migrations
pnpm install
pnpm drizzle-kit push

# Start dev server
pnpm dev                              → http://localhost:3000
```

For production (self-hosted):

```bash
pnpm build
pnpm start                            → http://localhost:3000
```

Or all-in-one with Docker Compose:

```yaml
# docker-compose.yml
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

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://birdie:birdie@db:5432/birdie
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  birdie_data:
```

```bash
docker-compose up                     → http://localhost:3000
```

Data lives in the `birdie_data` Docker volume. Back up with `pg_dump`. Runs on any machine with Docker.

### Post-MVP (Auth Enabled)

Same setup. Add env vars:

```
AUTH_SECRET=<random-secret>
AUTH_PROVIDER=credentials
```

Auth.js Credentials provider. Passwords hashed (bcrypt) and stored in the same Postgres instance. No external service, no OAuth. Email + password, fully self-contained.

---

## 4. Deployment Path B: Cloud

Managed services. No infrastructure to maintain.

### MVP (Day 1)

| Service | Provider | Notes |
|---|---|---|
| Next.js hosting | **Vercel** | Free tier. Automatic HTTPS, CDN, preview deploys. |
| PostgreSQL | **Neon** | Free tier. Serverless Postgres — scales to zero when idle. Same Postgres, different host. |

```bash
# Deploy
vercel deploy                         → https://birdie.vercel.app

# Set DATABASE_URL in Vercel env vars to the Neon connection string
# Run migrations
DATABASE_URL=<neon_url> pnpm drizzle-kit push
```

Why Neon? Serverless-native (instant cold starts, scale-to-zero on free tier), no Vercel lock-in (Vercel Postgres is Neon with a markup), and the `@neondatabase/serverless` driver works in Vercel's serverless functions. We want a database, not a platform — Supabase bundles auth/realtime/storage we don't need.

### Post-MVP (Auth Enabled)

Same Vercel + Neon. Add env vars:

```
AUTH_SECRET=<random-secret>
AUTH_PROVIDER=credentials
AUTH_GOOGLE_ID=<client-id>           # optional: add OAuth
AUTH_GOOGLE_SECRET=<client-secret>
```

---

## 5. Auth Architecture (Swappable, Added Last)

Auth.js is the single auth solution for both deployment paths. What changes between paths is **configuration**, not application code.

### The App's Auth Surface

```typescript
// Server Components / Server Actions
import { auth } from "@/lib/auth";

export default async function RoundHistory() {
  const session = await auth();
  const userId = session?.user?.id ?? "local";
  const rounds = await db.query.rounds.findMany({
    where: eq(rounds.userId, userId),
  });
}
```

```typescript
// Client Components
import { useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  // session is null when auth isn't configured — app still works
}
```

```typescript
// Middleware (route protection — post-MVP only)
export { auth as middleware } from "@/lib/auth";
export const config = { matcher: ["/round/:path*", "/trends/:path*"] };
```

The app always works. When auth isn't configured, `session` is null and the app falls back to `userId = "local"`. No conditional branches.

### MVP: No Auth

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [],
  callbacks: {
    async session() {
      return {
        user: { id: "local", email: "" },
        expires: "9999-12-31T23:59:59.999Z",
      };
    },
  },
});
```

No login page. No registration. `userId` is `"local"` on every round. Scoring works immediately.

### Post-MVP Local: Credentials Only

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      async authorize(credentials) {
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });
        if (!user) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        return valid ? user : null;
      },
    }),
  ],
  session: { strategy: "jwt" },
});
```

### Post-MVP Cloud: Credentials + OAuth

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({ /* same as above */ }),
    Google,
  ],
  session: { strategy: "database" },
});
```

Same app code. Same hooks. The only diff is the `providers` array and env vars.

### Implementation Order

1. **Build the entire MVP with the no-auth config.** `userId = "local"` everywhere. No login page.
2. **When adding multi-user:** add `users` table to Drizzle schema, swap auth config to Credentials, add `/login` and `/register` pages, replace `"local"` with `session.user.id`.
3. **Scoring still works without logging in.** Auth gates cloud sync, not scoring.

---

## 6. Database Schema (Drizzle)

```typescript
// src/lib/db/schema.ts
import { pgTable, uuid, text, integer, timestamp,
         pgEnum, jsonb, real, boolean } from "drizzle-orm/pg-core";

export const roundStatusEnum = pgEnum("round_status", ["active", "completed"]);
export const fairwayEnum = pgEnum("fairway", ["left", "hit", "right"]);
export const girEnum = pgEnum("gir", ["hit", "miss"]);
export const pinPositionEnum = pgEnum("pin_position", ["front", "center", "back"]);

export const rounds = pgTable("rounds", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().default("local"),
  courseName: text("course_name"),
  slope: real("slope"),
  courseRating: real("course_rating"),
  holeCount: integer("hole_count").notNull().default(18),
  pars: jsonb("pars").$type<number[]>(),
  status: roundStatusEnum("status").notNull().default("active"),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  roundId: uuid("round_id").notNull()
    .references(() => rounds.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const holeData = pgTable("hole_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id").notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  holeNumber: integer("hole_number").notNull(),
  score: integer("score"),
  putts: integer("putts"),
  fairway: fairwayEnum("fairway"),
  gir: girEnum("gir"),
  girMissDirection: jsonb("gir_miss_direction").$type<string[]>(),
  pinPosition: pinPositionEnum("pin_position").default("center"),
  penalties: integer("penalties").default(0),
  club: text("club"),
  upAndDown: boolean("up_and_down"),
  sandSave: boolean("sand_save"),
  notes: text("notes"),
});
```

---

## 7. Data Flow

### Scoring (On-Course)

```
User taps score/putts/GIR/etc.
  → Zustand store updates (memory — instant)
  → Zustand persist middleware writes to localStorage (synchronous — instant)
  → UI reflects change immediately

User swipes to next hole (or every N seconds via debounce):
  → Server Action: upsertHoleData(roundId, playerId, holeNumber, data)
  → Drizzle writes to Postgres
  → On success: scoring continues
  → On failure (offline/error): data is safe in localStorage, retry on next trigger
```

### Completing a Round

```
User taps "Finish Round"
  → Server Action: completeRound(roundId)
  → Writes all remaining hole data to Postgres
  → Sets round status = "completed"
  → Clears localStorage for this round
  → Redirects to post-round dashboard (Server Component, reads from Postgres)
```

### Viewing History / Dashboard / Trends

```
User navigates to history/dashboard/trends
  → Server Component renders on server
  → Drizzle queries Postgres directly (no API call, no client fetch)
  → HTML streamed to client
```

No client-side data fetching for read-heavy pages. Server Components do the work.

### Crash Recovery

```
App crashes or tab closes mid-round
  → User reopens app
  → Zustand restores state from localStorage
  → Scoring resumes exactly where it left off
  → Any data not yet persisted to Postgres is safe in localStorage
  → Next save action pushes it to Postgres
```

---

## 8. Project Structure

```
birdie/
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Root layout, Providers wrapper
│   │   ├── page.tsx                        # Landing page (static, no DB)
│   │   ├── (app)/                          # ── Off-course mode (sidebar + tabs) ──
│   │   │   ├── layout.tsx                  # App shell: sidebar (desktop), bottom tabs (mobile)
│   │   │   ├── rounds/
│   │   │   │   ├── page.tsx               # Round History (Server Component)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx           # Post-Round Dashboard (Server Component)
│   │   │   ├── trends/
│   │   │   │   └── page.tsx               # Multi-round trends (Server + Client)
│   │   │   └── new-round/
│   │   │       └── page.tsx               # Round setup (Client Component)
│   │   ├── (scoring)/                      # ── On-course mode (no sidebar) ──
│   │   │   └── round/[id]/
│   │   │       ├── layout.tsx             # Scoring layout: back button + tabs
│   │   │       ├── page.tsx               # Score Entry — core loop (Client Component)
│   │   │       ├── scorecard/
│   │   │       │   └── page.tsx           # Full card grid (Client/Server)
│   │   │       └── stats/
│   │   │           └── page.tsx           # On-course stats (Client Component)
│   │   ├── (auth)/                         # ── Auth pages (post-MVP) ──
│   │   │   ├── layout.tsx                 # Minimal layout, no sidebar
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── api/
│   │       └── auth/[...nextauth]/
│   │           └── route.ts               # Auth.js API route
│   ├── components/
│   │   ├── ui/                             # shadcn/ui (button, toggle, toast, etc.)
│   │   ├── app-shell/                      # Sidebar, TopBar, BottomTabs
│   │   ├── scoring/                        # ScoreStepper, ToggleGroup, MissDiamond,
│   │   │                                   # ClubSelector, HolePicker, FinishRoundDialog
│   │   ├── dashboard/                      # StatSummary, MissMap (SVG), ClubTable
│   │   ├── command-palette.tsx             # Global Cmd+K palette
│   │   ├── providers.tsx                   # ThemeContext, ToastProvider, CommandPalette
│   │   ├── round-card.tsx                  # Round list card
│   │   └── round-list.tsx                  # Round list container
│   ├── hooks/
│   │   └── use-keyboard-shortcuts.ts       # Global keyboard shortcut hook
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts                   # Drizzle schema (see §6)
│   │   │   ├── index.ts                    # Drizzle client + connection
│   │   │   ├── queries.ts                  # Read functions for Server Components
│   │   │   ├── types.ts                    # Shared TypeScript interfaces
│   │   │   └── migrations/                 # Auto-generated by drizzle-kit
│   │   ├── mock-data.ts                    # Mock data (removed after Phase 4)
│   │   ├── haptics.ts                      # Haptic feedback utility
│   │   ├── theme.ts                        # Dark/light theme context + hook
│   │   ├── auth.ts                         # Auth.js config (see §5)
│   │   └── export.ts                       # CSV + JSON export
│   ├── actions/
│   │   ├── rounds.ts                       # createRound, completeRound, deleteRound, fetchRound
│   │   ├── scoring.ts                      # upsertHoleData, bulkUpsertHoleData
│   │   ├── export.ts                       # generateCSV, generateJSON
│   │   └── auth.ts                         # registerUser, migrateLocalData (post-MVP)
│   ├── stores/
│   │   └── scoring-store.ts                # Zustand + localStorage persist
│   └── styles/
│       └── globals.css                     # Tailwind base + theme tokens + animations
├── scripts/
│   └── seed.ts                             # Dev seed script
├── tests/                                  # Playwright E2E tests
├── public/
│   └── icons/
├── drizzle.config.ts                       # Drizzle Kit config (reads DATABASE_URL)
├── vitest.config.ts                        # Vitest configuration
├── next.config.ts
├── tsconfig.json
├── docker-compose.yml                      # Postgres (+ optional app container)
├── Dockerfile                              # Multi-stage Next.js build
├── .env.local                              # DATABASE_URL, AUTH_SECRET, etc.
├── package.json
└── pnpm-lock.yaml
```

---

## 9. Environment Variables

| Variable | MVP (Local) | MVP (Cloud) | Post-MVP (Local) | Post-MVP (Cloud) |
|---|---|---|---|---|
| `DATABASE_URL` | `postgresql://birdie:birdie@localhost:5432/birdie` | `postgresql://...@neon.tech/birdie` | same | same |
| `AUTH_SECRET` | — | — | `<random>` | `<random>` |
| `AUTH_GOOGLE_ID` | — | — | — | `<client-id>` |
| `AUTH_GOOGLE_SECRET` | — | — | — | `<client-secret>` |

One connection string swap is all that differs between local and cloud in MVP.

---

## 10. Deployment Comparison

| Concern | Path A (Local) | Path B (Cloud) |
|---|---|---|
| **Postgres** | Docker container (`postgres:16-alpine`) | Neon (serverless, free tier) |
| **Next.js** | `pnpm start` or Docker container | Vercel (free tier) |
| **Domain / HTTPS** | localhost or Caddy reverse proxy | Vercel automatic |
| **Auth** | Auth.js + Credentials (Postgres-backed) | Auth.js + Credentials + OAuth |
| **Backups** | `pg_dump` to local file | Neon automatic point-in-time recovery |
| **Cost** | $0 | $0 (free tiers) |
| **Setup time** | ~5 min (Docker + pnpm dev) | ~10 min (Vercel + Neon accounts) |

Both paths ship the identical Next.js app. The only difference is where Postgres runs.

---

_The stack serves the product. The product serves the golfer._
