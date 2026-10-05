import type { NextResponse } from "next/server";
import { CSRF_COOKIE, REFRESH_COOKIE, SESSION_COOKIE } from "@/lib/auth-cookie-names";

const secure = process.env.NODE_ENV === "production";
const ttlDays = Number(process.env.REFRESH_TTL_DAYS ?? 30);
const maxAge = (Number.isFinite(ttlDays) && ttlDays > 0 ? ttlDays : 30) * 24 * 60 * 60;

// Refresh token is only sent to the BFF; the session marker lets the proxy redirect anonymous visitors.
const COOKIES = [
  { name: REFRESH_COOKIE, path: "/api/auth", httpOnly: true },
  { name: SESSION_COOKIE, path: "/", httpOnly: true },
  { name: CSRF_COOKIE, path: "/", httpOnly: false },
] as const;

export function setSessionCookies(response: NextResponse, refreshToken: string, csrfToken: string) {
  const values = { [REFRESH_COOKIE]: refreshToken, [SESSION_COOKIE]: "1", [CSRF_COOKIE]: csrfToken };
  for (const cookie of COOKIES) {
    response.cookies.set(cookie.name, values[cookie.name], {
      httpOnly: cookie.httpOnly,
      secure,
      sameSite: "strict",
      path: cookie.path,
      maxAge,
    });
  }
}

export function clearSessionCookies(response: NextResponse) {
  for (const cookie of COOKIES) {
    response.cookies.set(cookie.name, "", { httpOnly: cookie.httpOnly, secure, sameSite: "strict", path: cookie.path, maxAge: 0 });
  }
}
