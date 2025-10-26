import * as Sentry from "@sentry/nextjs";

// TODO: Set SENTRY_DSN in Vercel Environment Variables
// Example: https://o<org-id>.ingest.sentry.io/p<project-id>
//
// IMPORTANT: Also configure in Sentry Organization Settings:
// - "IP Address Collection" → off (GDPR compliance)
// - Region → EU (if applicable)
// - Data Scrubbing → on

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA,

  // Flexible sampling via env var (default: 0.1 prod, 1.0 dev)
  tracesSampleRate: Number(
    process.env.SENTRY_TRACES_SAMPLE_RATE ??
      (process.env.NODE_ENV === "production" ? "0.1" : "1.0")
  ),

  // GDPR: Do not send PII by default
  // User context should only be set after explicit consent via Sentry.setUser()
  sendDefaultPii: false,

  // Filter known noise patterns
  ignoreErrors: [
    // Network/timeout errors (usually transient)
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
    // Common Next.js false positives
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
  ],

  beforeSend(event) {
    // Filter health check pings (synthetic monitoring)
    const url = event.request?.url || "";
    if (url.includes("/api/health")) {
      return null;
    }

    // Filter synthetic monitoring bot traffic
    const userAgent = event.request?.headers?.["User-Agent"] || "";
    if (userAgent.includes("SyntheticHealthBot")) {
      return null;
    }

    // Note: User context (Sentry.setUser) should only be set after consent
    // See lib/observability.ts for helper functions

    return event;
  },

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
