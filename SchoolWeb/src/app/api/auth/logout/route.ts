import type { NextRequest } from "next/server";
import { REFRESH_COOKIE } from "@/lib/auth-cookie-names";
import { hasValidCsrf } from "@/server/csrf";
import { errorResponse, okResponse, readTokens } from "@/server/token-response";
import { forwardedHeaders, postToApi } from "@/server/upstream";

// /auth/logout needs a valid access token; with an expired one, rotate once so the session is still revoked.
async function revoke(request: NextRequest, refreshToken: string | undefined) {
  const headers = forwardedHeaders(request, true);
  const first = await postToApi("/auth/logout", { refreshToken }, headers);
  if (first.status !== 401 || !refreshToken) return;
  const tokens = readTokens(await postToApi("/auth/refresh", { refreshToken }, forwardedHeaders(request)));
  if (!tokens) return;
  await postToApi(
    "/auth/logout",
    { refreshToken: tokens.refreshToken },
    { ...headers, Authorization: `Bearer ${tokens.accessToken}` },
  );
}

export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return errorResponse(403, "FORBIDDEN", "Invalid request token.", true);
  await revoke(request, request.cookies.get(REFRESH_COOKIE)?.value);
  return okResponse(true);
}
