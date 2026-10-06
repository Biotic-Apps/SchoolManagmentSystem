import { createHash } from 'node:crypto';

interface TrackedRequest {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
}

const bearer = (header: unknown): string | undefined => {
  if (typeof header !== 'string') return undefined;
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : undefined;
};

/** Client address; `req.ip` honours the `trust proxy` allow-list. */
export const ipTracker = (req: TrackedRequest): string =>
  `ip:${req.ip ?? 'unknown'}`;

/**
 * General API limit per caller (security.md §6): authenticated requests count
 * against their access token (so a whole school behind one NAT address does
 * not share a budget), anonymous ones against the client IP. The token is
 * hashed, never stored; a forged token only spends its own budget and is
 * rejected by JwtAuthGuard anyway.
 */
export const callerTracker = (req: TrackedRequest): string => {
  const token = bearer(req.headers?.authorization);
  if (!token) return ipTracker(req);
  const digest = createHash('sha256').update(token).digest('base64url');
  return `tok:${digest.slice(0, 32)}`;
};
