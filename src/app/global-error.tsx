"use client";

/**
 * Global error boundary — catches errors in the root layout itself.
 * This must render its own <html> and <body> since the root layout
 * may have failed to render.
 *
 * Never exposes stack traces or internal details to the user.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#283618",
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "400px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "2rem",
            }}
          >
            ⚠️
          </div>

          <h1
            style={{
              color: "#FEFAE0",
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              color: "rgba(254, 250, 224, 0.5)",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
              lineHeight: 1.5,
            }}
          >
            A critical error occurred. Please try refreshing the page.
            {error.digest && (
              <span
                style={{
                  display: "block",
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  color: "rgba(254, 250, 224, 0.3)",
                }}
              >
                Error ID: {error.digest}
              </span>
            )}
          </p>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                backgroundColor: "#DDA15E",
                color: "#283618",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.75rem 1.5rem",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={{
                backgroundColor: "transparent",
                color: "rgba(254, 250, 224, 0.6)",
                border: "1px solid rgba(96, 108, 56, 0.5)",
                borderRadius: "0.5rem",
                padding: "0.75rem 1.5rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
