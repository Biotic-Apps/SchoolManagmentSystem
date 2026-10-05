function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/** Nonce-based CSP (security.md §7): scripts only from self or with this request's nonce. */
export function buildCsp(nonce: string, isDev: boolean): string {
  const api = originOf(process.env.NEXT_PUBLIC_API_URL);
  const assets = (process.env.NEXT_PUBLIC_ASSET_ORIGINS ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const remote = [api, ...assets].filter(Boolean).join(" ");

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Radix positions popovers with inline style attributes.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data: ${remote}`.trim(),
    "font-src 'self'",
    `connect-src 'self' ${remote}${isDev ? " ws: wss:" : ""}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (!isDev) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}
