/**
 * Environment variable access with fail-fast behavior.
 *
 * Usage:
 *   import { env } from "@/lib/env";
 *   const url = env.DATABASE_URL; // throws if missing
 */

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[env] Missing required environment variable: ${key}. ` +
        `See .env.example for all required variables.`
    );
  }
  return value;
}

function optional(key: string, fallback: string = ""): string {
  return process.env[key] ?? fallback;
}

/** Lazily-evaluated env config — only throws when a value is actually accessed. */
export const env = {
  /** PostgreSQL connection string. Required for any DB operation. */
  get DATABASE_URL(): string {
    return required("DATABASE_URL");
  },

  /** Auth.js / NextAuth secret for signing session tokens. */
  get AUTH_SECRET(): string {
    return required("AUTH_SECRET");
  },

  /** Public app URL for OG images, auth callbacks, etc. */
  get NEXT_PUBLIC_APP_URL(): string {
    return optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  },

  /** True when running on Vercel. */
  get IS_VERCEL(): boolean {
    return !!process.env.VERCEL;
  },

  /** Current Vercel environment: "production" | "preview" | "development" */
  get VERCEL_ENV(): string {
    return optional("VERCEL_ENV", "development");
  },

  /** True in production. */
  get IS_PRODUCTION(): boolean {
    return process.env.NODE_ENV === "production";
  },
};
