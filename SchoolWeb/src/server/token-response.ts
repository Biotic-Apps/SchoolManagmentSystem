import { NextResponse } from "next/server";
import { clearSessionCookies, setSessionCookies } from "./auth-cookies";
import type { UpstreamResult } from "./upstream";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  mustChangePassword: boolean;
}

const NO_STORE = { "Cache-Control": "no-store" };

/** Login answers `{ twoFactorRequired, challengeId }` instead of tokens when 2FA is on (phase5-contract §B). */
export function readTwoFactorChallenge({ status, payload }: UpstreamResult): NextResponse | null {
  if (status < 200 || status >= 300) return null;
  const data = (payload as { data?: { twoFactorRequired?: boolean; challengeId?: string } } | null)?.data;
  if (!data?.twoFactorRequired || typeof data.challengeId !== "string") return null;
  return NextResponse.json({ data: { twoFactorRequired: true, challengeId: data.challengeId } }, { headers: NO_STORE });
}

export function readTokens({ status, payload }: UpstreamResult): AuthTokens | null {
  if (status < 200 || status >= 300) return null;
  const data = (payload as { data?: Partial<AuthTokens> } | null)?.data;
  if (!data?.accessToken || !data.refreshToken) return null;
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    accessExpiresIn: Number(data.accessExpiresIn ?? 900),
    mustChangePassword: !!data.mustChangePassword,
  };
}

/** The browser receives only the access token and its lifetime; the refresh token stays in an httpOnly cookie. */
export function tokenResponse(tokens: AuthTokens, csrfToken: string): NextResponse {
  const { accessToken, accessExpiresIn, mustChangePassword } = tokens;
  const response = NextResponse.json({ data: { accessToken, accessExpiresIn, mustChangePassword } }, { headers: NO_STORE });
  setSessionCookies(response, tokens.refreshToken, csrfToken);
  return response;
}

export function errorResponse(status: number, code: string, message: string, clearCookies = false): NextResponse {
  const response = NextResponse.json({ error: { code, message } }, { status, headers: NO_STORE });
  if (clearCookies) clearSessionCookies(response);
  return response;
}

export function upstreamError({ status, payload }: UpstreamResult, clearCookies = false): NextResponse {
  const body = (payload as { error?: unknown } | null)?.error
    ? payload
    : { error: { code: "HTTP_ERROR", message: `Request failed (${status}).` } };
  const response = NextResponse.json(body, { status: status >= 400 ? status : 502, headers: NO_STORE });
  if (clearCookies) clearSessionCookies(response);
  return response;
}

export function okResponse(clearCookies = false): NextResponse {
  const response = NextResponse.json({ data: { ok: true } }, { headers: NO_STORE });
  if (clearCookies) clearSessionCookies(response);
  return response;
}
