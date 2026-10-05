import type { NextRequest } from "next/server";
import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/auth-cookie-names";

export function newCsrfToken(): string {
  return crypto.randomUUID();
}

export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site";
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

/** SameSite=Strict plus a double-submit token (security.md §7). */
export function hasValidCsrf(request: NextRequest): boolean {
  const cookie = request.cookies.get(CSRF_COOKIE)?.value;
  const header = request.headers.get(CSRF_HEADER);
  return isSameOrigin(request) && !!cookie && cookie === header;
}
