/**
 * Consistent API error response format.
 *
 * All API routes should use these utilities to ensure:
 * - Uniform JSON shape: { error: string, status: number }
 * - No stack traces or internal details leak in production
 * - Proper HTTP status codes
 */

import { NextResponse } from "next/server";

interface ErrorResponseBody {
  error: string;
  status: number;
}

/**
 * Return a JSON error response with the given message and status.
 *
 * @example
 *   return apiError("Round not found", 404);
 *   return apiError("Invalid request body", 400);
 */
export function apiError(
  message: string,
  status: number = 500
): NextResponse<ErrorResponseBody> {
  return NextResponse.json({ error: message, status }, { status });
}

/**
 * Wrap an API route handler to catch unhandled errors and return
 * consistent JSON instead of stack traces.
 *
 * @example
 *   export const GET = withErrorHandler(async (req) => {
 *     // ... your logic ...
 *     return NextResponse.json({ data });
 *   });
 */
export function withErrorHandler(
  handler: (req: Request) => Promise<NextResponse>
) {
  return async (req: Request): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (err) {
      // Log full error server-side only
      if (process.env.NODE_ENV === "development") {
        console.error("[API Error]", err);
      }

      // Never expose internals to the client
      const message =
        err instanceof Error && process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error";

      return apiError(message, 500);
    }
  };
}

/**
 * Standard timeout for API route handlers (in milliseconds).
 * Prevents any single request from hanging indefinitely.
 */
export const API_TIMEOUT_MS = 10_000; // 10 seconds

/**
 * Create an AbortSignal that times out after the given duration.
 * Pass to fetch() or database queries.
 *
 * @example
 *   const signal = timeoutSignal(5000);
 *   const data = await fetch(url, { signal });
 */
export function timeoutSignal(ms: number = API_TIMEOUT_MS): AbortSignal {
  return AbortSignal.timeout(ms);
}
