import type { NextRequest } from "next/server";

const API_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export interface UpstreamResult {
  status: number;
  payload: unknown;
  /** Seconds from the API's Retry-After (or a named throttler's Retry-After-<name>) on a 429. */
  retryAfter?: string;
}

function retryAfterOf(headers: Headers): string | undefined {
  let value = headers.get("retry-after") ?? undefined;
  headers.forEach((headerValue, name) => {
    if (!value && name.toLowerCase().startsWith("retry-after-")) value = headerValue;
  });
  return value && /^\d{1,6}$/.test(value.trim()) ? value.trim() : undefined;
}

const UNREACHABLE: UpstreamResult = {
  status: 502,
  payload: { error: { code: "NETWORK_ERROR", message: "Cannot reach the server." } },
};

/**
 * Only the right-most X-Forwarded-For entry is passed on: it is the one our own reverse proxy appended,
 * while anything to its left is client-supplied and could be used to dodge the API's per-IP limits.
 */
function clientIp(request: NextRequest): string | null {
  const entries = (request.headers.get("x-forwarded-for") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const last = entries.at(-1);
  return last && /^[0-9a-fA-F:.]{2,45}$/.test(last) ? last : null;
}

/** Headers the API needs for device/IP tracking and rate limits. */
export function forwardedHeaders(request: NextRequest, withAuth = false): Record<string, string> {
  const headers: Record<string, string> = {};
  const userAgent = request.headers.get("user-agent");
  const forwardedFor = clientIp(request);
  const authorization = request.headers.get("authorization");
  if (userAgent) headers["User-Agent"] = userAgent;
  if (forwardedFor) headers["X-Forwarded-For"] = forwardedFor;
  if (withAuth && authorization) headers.Authorization = authorization;
  return headers;
}

export async function postToApi(path: string, body: unknown, headers: Record<string, string>): Promise<UpstreamResult> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    });
    const text = await response.text();
    let payload: unknown = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = null;
    }
    return { status: response.status, payload, retryAfter: retryAfterOf(response.headers) };
  } catch {
    return UNREACHABLE;
  }
}
