import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * Sentry event tunnel endpoint
 *
 * Proxies Sentry events through our domain to bypass ad-blockers
 * that block requests to sentry.io domains.
 *
 * Usage: Set tunnel: "/monitoring" in sentry.client.config.ts
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const envelope = body.split("\n")[0];

    // Extract DSN from envelope header
    let dsn: string | undefined;
    try {
      const envelopeHeader = JSON.parse(envelope);
      dsn = envelopeHeader.dsn;
    } catch {
      // If we can't parse DSN from envelope, use env var
      dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    }

    if (!dsn) {
      console.error("[Sentry Tunnel] No DSN found");
      return new NextResponse(null, { status: 400 });
    }

    // Parse DSN to get Sentry ingest URL
    // Format: https://<key>@<org>.ingest.sentry.io/<project>
    const dsnMatch = dsn.match(/^https:\/\/(.+)@(.+?)\/(.+)$/);
    if (!dsnMatch) {
      console.error("[Sentry Tunnel] Invalid DSN format");
      return new NextResponse(null, { status: 400 });
    }

    const [, key, host, projectId] = dsnMatch;
    const sentryIngestUrl = `https://${host}/api/${projectId}/envelope/`;

    // Forward to Sentry
    const response = await fetch(sentryIngestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${key}`,
      },
      body,
    });

    return new NextResponse(null, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("[Sentry Tunnel] Error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
