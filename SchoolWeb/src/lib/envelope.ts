import { ApiError, type ApiErrorBody } from "./api-error";

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiResult<T, M = PageMeta> {
  data: T;
  meta?: M;
}

export async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function toApiError(status: number, payload: unknown): ApiError {
  const body = (payload as { error?: ApiErrorBody } | null)?.error;
  if (body?.code) return new ApiError(status, body);
  return new ApiError(status, { code: "HTTP_ERROR", message: `Request failed (${status}).` });
}

export async function parseEnvelope<T, M = PageMeta>(response: Response): Promise<ApiResult<T, M>> {
  const payload = await readJson(response);
  if (!response.ok) throw toApiError(response.status, payload);
  return (payload ?? { data: null }) as ApiResult<T, M>;
}
