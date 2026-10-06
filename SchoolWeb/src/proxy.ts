import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-cookie-names";
import { buildCsp } from "@/lib/csp";

const isDev = process.env.NODE_ENV === "development";
const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];

// Dev-only shell preview (NEXT_PUBLIC_DEMO_ROLE) has no session cookie.
const demoMode = isDev && !!process.env.NEXT_PUBLIC_DEMO_ROLE;

function needsSignIn(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  if (demoMode || PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return false;
  return !request.cookies.has(SESSION_COOKIE);
}

function loginRedirect(request: NextRequest): NextResponse {
  const url = new URL("/login", request.url);
  const { pathname, search } = request.nextUrl;
  if (pathname !== "/") url.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  if (needsSignIn(request)) return loginRedirect(request);

  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce, isDev);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
