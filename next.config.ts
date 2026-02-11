import type { NextConfig } from "next";

// ── Security Headers ───────────────────────────────────────────
const securityHeaders = [
  // Prevent clickjacking — app cannot be embedded in iframes
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information sent with requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser features the app doesn't need
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Enforce HTTPS (1 year, include subdomains)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Content Security Policy — restrict what the app can load
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js requires inline scripts
      "style-src 'self' 'unsafe-inline'",                  // Tailwind injects inline styles
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Don't advertise Next.js in response headers
  poweredByHeader: false,

  // Enable gzip/brotli compression (Vercel does this at the CDN layer,
  // but this ensures it works in self-hosted environments too)
  compress: true,

  // Strip console.log in production builds for cleaner output
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  async headers() {
    return [
      // ── Security headers on all routes ──
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // ── Long-lived cache for hashed static assets ──
      // Next.js already fingerprints these files in /_next/static/
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ── Cache static files in /public ──
      {
        source: "/(.*)\\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=43200",
          },
        ],
      },
      // ── No-cache for HTML pages (always fresh) ──
      {
        source: "/((?!_next/static|api/).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      // ── No-cache for API routes ──
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
