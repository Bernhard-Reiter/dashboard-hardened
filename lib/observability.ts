import * as Sentry from "@sentry/nextjs";

/**
 * Tag Sentry event with request ID for correlation across logs/traces
 * Call this early in API route handlers or server components
 *
 * @param request - Next.js Request object
 * @returns The request ID (or null if not found)
 */
export function tagRequestId(request: Request): string | null {
  const requestId = request.headers.get("x-request-id");

  if (requestId) {
    Sentry.setTag("request_id", requestId);
  }

  return requestId;
}

/**
 * Set user context for Sentry (call after auth)
 *
 * @param userId - User ID
 * @param email - User email (optional)
 */
export function setUserContext(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email,
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}
