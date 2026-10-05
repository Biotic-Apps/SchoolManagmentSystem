import type { NextRequest } from "next/server";

const API_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export interface UpstreamResult {
  status: number;
  payload: unknown;
}

const UNREACHABLE: UpstreamResult = {
  status: 502,
  payload: { error: { code: "NETWORK_ERROR", message: "Cannot reach the server." } },
};

/** Headers the API needs for device/IP tracking and rate limits. */
export function forwardedHeaders(request: NextRequest, withAuth = false): Record<string, string> {
  const headers: Record<string, string> = {};
  const userAgent = request.headers.get("user-agent");
  const forwardedFor = request.headers.get("x-forwarded-for");
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
    return { status: response.status, payload };
  } catch {
    return UNREACHABLE;
  }
}
