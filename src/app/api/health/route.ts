import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Returns the application health status.
 * When a database is configured, this will also ping the DB
 * and report its connectivity status.
 */
export async function GET() {
  const health: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version ?? "0.1.0",
    environment: process.env.NODE_ENV ?? "unknown",
  };

  // ── Database health check (activate in Phase 1) ──
  // Uncomment when Drizzle + postgres.js are added:
  //
  // try {
  //   const start = Date.now();
  //   await db.execute(sql`SELECT 1`);
  //   health.database = {
  //     status: "ok",
  //     latency_ms: Date.now() - start,
  //   };
  // } catch (err) {
  //   health.database = {
  //     status: "error",
  //     message: "Database unreachable",
  //   };
  //   health.status = "degraded";
  // }

  const statusCode = health.status === "ok" ? 200 : 503;

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
