import type { NextRequest } from "next/server";
import { isSameOrigin, newCsrfToken } from "@/server/csrf";
import { deviceName } from "@/server/device-name";
import { errorResponse, readTokens, readTwoFactorChallenge, tokenResponse, upstreamError } from "@/server/token-response";
import { forwardedHeaders, postToApi } from "@/server/upstream";

async function readEmailCode(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: unknown; code?: unknown };
    if (typeof body.email !== "string" || typeof body.code !== "string") return null;
    const email = body.email.trim().toLowerCase();
    const code = body.code.replace(/\s/g, "");
    if (!email.includes("@") || email.length > 254 || !code || code.length > 12) return null;
    return { email, code };
  } catch {
    return null;
  }
}

// Parent email-code sign-in (phase6-contract §B): same cookie handling as /api/auth/login, incl. the 2FA challenge answer.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "FORBIDDEN", "Cross-site request blocked.");
  const input = await readEmailCode(request);
  if (!input) return errorResponse(400, "VALIDATION_FAILED", "Enter your email address and the code you received.");

  const result = await postToApi(
    "/auth/otp/verify",
    { ...input, platform: "WEB", deviceName: deviceName(request.headers.get("user-agent")) },
    forwardedHeaders(request),
  );
  const tokens = readTokens(result);
  if (tokens) return tokenResponse(tokens, newCsrfToken());
  return readTwoFactorChallenge(result) ?? upstreamError(result);
}
