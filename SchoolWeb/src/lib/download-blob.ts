import { API_URL } from "@/config/env";
import { networkError } from "./api-error";
import { readJson, toApiError } from "./envelope";
import { isHttpUrl } from "./safe-url";
import { getAccessToken, getActiveRoleHeader, getAuthHandlers } from "./request-context";

function authHeaders(): Headers {
  const headers = new Headers({ Accept: "*/*" });
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const role = getActiveRoleHeader();
  if (role) headers.set("X-Active-Role", role);
  return headers;
}

async function fetchWithAuth(url: string, retried = false): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, { headers: authHeaders() });
  } catch {
    throw networkError();
  }
  const handlers = getAuthHandlers();
  if (response.status === 401 && handlers && !retried && (await handlers.refresh())) {
    return fetchWithAuth(url, true);
  }
  return response;
}

function fileNameFrom(disposition: string | null, fallback: string): string {
  const match = disposition && /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return match ? decodeURIComponent(match[1]) : fallback;
}

function clickLink(href: string, fileName?: string) {
  const link = document.createElement("a");
  link.href = href;
  if (fileName) link.download = fileName;
  else {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Downloads an authenticated API file. Binary answers are saved through an object URL;
 * a JSON answer `{ data: { url } }` (signed URL) is opened directly.
 */
export async function downloadBlob(path: string, fallbackName: string): Promise<void> {
  const response = await fetchWithAuth(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`);
  const contentType = response.headers.get("Content-Type") ?? "";

  if (!response.ok || contentType.includes("application/json")) {
    const payload = await readJson(response);
    if (!response.ok) throw toApiError(response.status, payload);
    const url = (payload as { data?: { url?: string } } | null)?.data?.url;
    if (!url || !isHttpUrl(url)) throw toApiError(500, payload);
    clickLink(url);
    return;
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  clickLink(objectUrl, fileNameFrom(response.headers.get("Content-Disposition"), fallbackName));
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
