/** Signed download URLs from the API must be http(s); anything else (e.g. javascript:) is refused. */
export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value, window.location.origin);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}
