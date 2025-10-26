import * as Sentry from "@sentry/nextjs";

// TODO: Set NEXT_PUBLIC_SENTRY_DSN in Vercel Environment Variables
// Example: https://o<org-id>.ingest.sentry.io/p<project-id>
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA,

  // Flexible sampling via env var (default: 0.1 prod, 1.0 dev)
  tracesSampleRate: Number(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ??
      (process.env.NODE_ENV === "production" ? "0.1" : "1.0")
  ),

  // Filter known noise patterns
  ignoreErrors: [
    // Browser rendering quirks
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",

    // Chunk loading errors (usually recoverable)
    "ChunkLoadError",
    /Loading chunk .* failed/,

    // Network issues (user-side)
    "NetworkError when attempting to fetch resource",
    "Failed to fetch",
    "Load failed",

    // Browser extension interference
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],

  beforeSend(event) {
    // Filter health check pings (no value in tracking)
    if (event.request?.url?.includes("/api/health")) {
      return null;
    }

    // Filter bot/crawler traffic if needed
    const userAgent = event.request?.headers?.["User-Agent"] || "";
    if (/bot|crawler|spider/i.test(userAgent)) {
      return null;
    }

    return event;
  },

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
