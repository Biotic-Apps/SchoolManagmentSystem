import type { NextRequest } from "next/server";
import { isSameOrigin, newCsrfToken } from "@/server/csrf";
import { deviceName } from "@/server/device-name";
import { errorResponse, readTokens, readTwoFactorChallenge, tokenResponse, upstreamError } from "@/server/token-response";
import { forwardedHeaders, postToApi } from "@/server/upstream";

async function readCredentials(request: NextRequest) {
  try {
    const body = (await request.json()) as { identifier?: unknown; password?: unknown };
    if (typeof body.identifier !== "string" || typeof body.password !== "string") return null;
    return { identifier: body.identifier.trim(), password: body.password };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "FORBIDDEN", "Cross-site request blocked.");
  const credentials = await readCredentials(request);
  if (!credentials) return errorResponse(400, "VALIDATION_FAILED", "Enter your email or phone and password.");

  const result = await postToApi(
    "/auth/login",
    { ...credentials, platform: "WEB", deviceName: deviceName(request.headers.get("user-agent")) },
    forwardedHeaders(request),
  );
  const tokens = readTokens(result);
  if (tokens) return tokenResponse(tokens, newCsrfToken());
  return readTwoFactorChallenge(result) ?? upstreamError(result);
}
