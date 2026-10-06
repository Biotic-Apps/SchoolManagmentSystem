import { API_URL } from "@/config/env";
import { hasErrorCode, networkError } from "./api-error";
import { readJson, toApiError, type ApiResult, type PageMeta } from "./envelope";
import { getAccessToken, getActiveRoleHeader, getAuthHandlers } from "./request-context";

export type { ApiResult, PageMeta } from "./envelope";

const SESSION_CODES = new Set(["UNAUTHENTICATED", "SESSION_REVOKED", "HTTP_ERROR"]);

export type Query =Record<string, string | number | boolean | undefined | null>;

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Query;
}

function buildUrl(path: string, query?: Query): string {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

function buildHeaders(init: HeadersInit | undefined, body: unknown): Headers {
  const headers = new Headers(init);
  headers.set("Accept", "application/json");
  if (body !== undefined && !(body instanceof FormData)) headers.set("Content-Type", "application/json");
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const role = getActiveRoleHeader();
  if (role) headers.set("X-Active-Role", role);
  return headers;
}

function encodeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  return body instanceof FormData ? body : JSON.stringify(body);
}

async function send<T, M>(path: string, options: RequestOptions, retried: boolean): Promise<ApiResult<T, M>> {
  const { body, query, headers, ...init } = options;
  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      headers: buildHeaders(headers, body),
      body: encodeBody(body),
    });
  } catch {
    throw networkError();
  }

  const payload = await readJson(response);
  if (response.ok) return (payload ?? { data: null }) as ApiResult<T, M>;

  const error = toApiError(response.status, payload);
  const handlers = getAuthHandlers();
  if (handlers && response.status === 401 && SESSION_CODES.has(error.code)) {
    // One silent refresh (single-flight) then retry once; otherwise the session is over.
    if (!retried && (await handlers.refresh())) return send<T, M>(path, options, true);
    handlers.onExpired();
  }
  if (hasErrorCode(error, "PASSWORD_CHANGE_REQUIRED")) handlers?.onPasswordChangeRequired();
  throw error;
}

export function request<T, M = PageMeta>(path: string, options: RequestOptions = {}): Promise<ApiResult<T, M>> {
  return send<T, M>(path, options, false);
}

export const http = {
  get: <T, M = PageMeta>(path: string, query?: Query) => request<T, M>(path, { method: "GET", query }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string, body?: unknown) => request<T>(path, { method: "DELETE", body }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
};
