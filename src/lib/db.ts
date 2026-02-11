/**
 * Database connection with connection pooling.
 *
 * This file is a scaffold — it will be activated in Phase 1
 * of the implementation plan when the Drizzle ORM and PostgreSQL
 * dependencies are added.
 *
 * Until then, importing this file will throw a clear error
 * if DATABASE_URL is not set, preventing silent failures.
 *
 * Future usage:
 *   import { db } from "@/lib/db";
 *   const rounds = await db.select().from(roundsTable).where(...);
 */

import { env } from "@/lib/env";

// ── Connection pool config ──
// These will be passed to postgres.js when the driver is added.
export const DB_POOL_CONFIG = {
  /** Maximum number of connections in the pool */
  max: 10,
  /** Idle connection timeout in seconds */
  idle_timeout: 20,
  /** Connection timeout in seconds */
  connect_timeout: 10,
} as const;

/**
 * Validates that the database connection string is configured.
 * Call this at app startup or before the first DB query.
 */
export function assertDatabaseConfigured(): void {
  // Accessing env.DATABASE_URL will throw if missing
  const url = env.DATABASE_URL;
  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    throw new Error(
      `[db] DATABASE_URL must start with postgresql:// or postgres://. ` +
        `Got: ${url.slice(0, 15)}...`
    );
  }
}

// ── Placeholder exports ──
// Uncomment and implement when adding Drizzle + postgres.js in Phase 1:
//
// import postgres from "postgres";
// import { drizzle } from "drizzle-orm/postgres-js";
// import * as schema from "./db/schema";
//
// const client = postgres(env.DATABASE_URL, {
//   ...DB_POOL_CONFIG,
//   ssl: env.IS_PRODUCTION ? "require" : false,
//   prepare: false, // required for Supabase/Neon transaction pooling
// });
//
// export const db = drizzle(client, { schema });
