import type { NextRequest } from "next/server";
import { isSameOrigin, newCsrfToken } from "@/server/csrf";
import { errorResponse, readTokens, tokenResponse, upstreamError } from "@/server/token-response";
import { forwardedHeaders, postToApi } from "@/server/upstream";

async function readChallenge(request: NextRequest) {
  try {
    const body = (await request.json()) as { challengeId?: unknown; code?: unknown };
    if (typeof body.challengeId !== "string" || typeof body.code !== "string") return null;
    const code = body.code.trim();
    if (!body.challengeId || !code || code.length > 64) return null;
    return { challengeId: body.challengeId, code };
  } catch {
    return null;
  }
}

// Second login step: exchanges the challenge + TOTP or recovery code for tokens (refresh token → httpOnly cookie).
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "FORBIDDEN", "Cross-site request blocked.");
  const challenge = await readChallenge(request);
  if (!challenge) return errorResponse(400, "VALIDATION_FAILED", "Enter the code from your authenticator app.");

  const result = await postToApi("/auth/2fa/verify", challenge, forwardedHeaders(request));
  const tokens = readTokens(result);
  return tokens ? tokenResponse(tokens, newCsrfToken()) : upstreamError(result);
}
