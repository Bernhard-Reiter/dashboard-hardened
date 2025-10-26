// middleware.ts
import { NextResponse } from "next/server";

export const config = {
  // Statische Assets, Next-Interna und die Monitoring-Endpoint ausnehmen
  matcher: ["/((?!_next/static|_next/image|favicon.ico|monitoring).*)"],
};

export function middleware(req: Request) {
  const res = NextResponse.next();

  // 1) Request-ID (nur setzen, wenn nicht bereits vorhanden)
  const existing = (req.headers as any).get?.("x-request-id");
  const requestId = existing ?? crypto.randomUUID();
  res.headers.set("x-request-id", requestId);

  // 2) Strikte CSP – mit First-Party Sentry Tunneling kompatibel (connect-src 'self')
  //   - Keine externen Script/Connect-Quellen nötig, da /monitoring verwendet wird.
  //   - 'unsafe-inline' bei style ist für Next.js nötig (Inline-CSS in <style>).
  const csp = [
    "default-src 'self'",
    "frame-ancestors 'none'",
    "connect-src 'self'",
    "img-src 'self' data:",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
  ].join("; ");

  res.headers.set("content-security-policy", csp);

  return res;
}
