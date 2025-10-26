import * as Sentry from "@sentry/nextjs";

// TODO: Set SENTRY_DSN in Vercel Environment Variables
// Example: https://o<org-id>.ingest.sentry.io/p<project-id>
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA,

  // Flexible sampling via env var (default: 0.1 prod, 1.0 dev)
  tracesSampleRate: Number(
    process.env.SENTRY_TRACES_SAMPLE_RATE ??
      (process.env.NODE_ENV === "production" ? "0.1" : "1.0")
  ),

  // Filter known noise patterns
  ignoreErrors: [
    // Network/timeout errors (usually transient)
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
  ],

  beforeSend(event) {
    // Filter health check pings
    if (event.request?.url?.includes("/api/health")) {
      return null;
    }

    return event;
  },

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
