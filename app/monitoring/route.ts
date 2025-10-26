import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * Hardened Sentry event tunnel endpoint
 *
 * Security features:
 * - Content-Type validation (x-sentry-envelope only)
 * - Payload size limit (200 KB)
 * - DSN public key allowlist (optional but recommended)
 * - Minimal error responses (no leak)
 *
 * Privacy features:
 * - No logging of event contents
 * - DSGVO-compliant by design
 */

// OPTIONAL: Allowlist your public Sentry DSN keys
// Extract from NEXT_PUBLIC_SENTRY_DSN: https://<publicKey>@...
// Example: const ALLOWED_PUBLIC_KEYS = new Set(["abc123def456"]);
const ALLOWED_PUBLIC_KEYS = new Set<string>([
  // Add your public keys here for additional security
]);

const MAX_ENVELOPE_BYTES = 200 * 1024; // 200 KB hard limit

export async function POST(req: NextRequest) {
  // Validate Content-Type
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/x-sentry-envelope")) {
    return new NextResponse(null, { status: 415 }); // Unsupported Media Type
  }

  // Read and validate size
  const enc = await req.arrayBuffer();
  if (enc.byteLength > MAX_ENVELOPE_BYTES) {
    return new NextResponse(null, { status: 413 }); // Payload Too Large
  }

  // Parse envelope header (first line is JSON)
  const text = new TextDecoder().decode(enc);
  const firstNL = text.indexOf("\n");
  const header = firstNL === -1 ? text : text.slice(0, firstNL);

  try {
    const parsed = JSON.parse(header);
    const dsn: string | undefined = parsed?.dsn;

    if (!dsn) {
      return new NextResponse(null, { status: 400 });
    }

    // Optional: Validate DSN public key against allowlist
    if (ALLOWED_PUBLIC_KEYS.size > 0) {
      const match = dsn.match(/^https?:\/\/([^@]+)@/i);
      const publicKey = match?.[1];
      if (!publicKey || !ALLOWED_PUBLIC_KEYS.has(publicKey)) {
        return new NextResponse(null, { status: 403 }); // Forbidden
      }
    }

    // Parse DSN to get Sentry ingest URL
    // Format: https://<key>@<org>.ingest.sentry.io/<project>
    const dsnMatch = dsn.match(/^https?:\/\/(.+)@(.+?)\/(.+)$/);
    if (!dsnMatch) {
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
      body: enc,
    });

    // Minimal response - no details leak
    return new NextResponse(null, { status: response.ok ? 204 : response.status });
  } catch {
    return new NextResponse(null, { status: 400 });
  }
}

// Block other methods
export function GET() {
  return new NextResponse(null, { status: 405 }); // Method Not Allowed
}

export function PUT() {
  return new NextResponse(null, { status: 405 });
}

export function DELETE() {
  return new NextResponse(null, { status: 405 });
}
