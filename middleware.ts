import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Matcher excludes static files, images, and favicon
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Generate unique request ID for tracing/correlation
  const requestId = crypto.randomUUID();
  response.headers.set("x-request-id", requestId);

  return response;
}
