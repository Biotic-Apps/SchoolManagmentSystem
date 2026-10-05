import type { NextRequest } from "next/server";
import { CSRF_COOKIE, REFRESH_COOKIE } from "@/lib/auth-cookie-names";
import { hasValidCsrf } from "@/server/csrf";
import { errorResponse, readTokens, tokenResponse, upstreamError } from "@/server/token-response";
import { forwardedHeaders, postToApi } from "@/server/upstream";

export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return errorResponse(403, "FORBIDDEN", "Invalid request token.");
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return errorResponse(401, "UNAUTHENTICATED", "Not signed in.", true);

  const result = await postToApi("/auth/refresh", { refreshToken }, forwardedHeaders(request));
  const tokens = readTokens(result);
  if (!tokens) return upstreamError(result, result.status === 401 || result.status === 403);
  return tokenResponse(tokens, request.cookies.get(CSRF_COOKIE)!.value);
}
