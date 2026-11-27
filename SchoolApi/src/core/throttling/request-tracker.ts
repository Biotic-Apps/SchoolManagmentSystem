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

interface CredentialRequest extends TrackedRequest {
  body?: unknown;
}

/** The account an anonymous credential request is about (login identifier, OTP email/phone), lower-cased. */
const credentialSubject = (body: unknown): string | undefined => {
  if (!body || typeof body !== 'object') return undefined;
  const fields = body as Record<string, unknown>;
  for (const key of ['identifier', 'email', 'phone']) {
    const value = fields[key];
    if (typeof value === 'string' && value.trim())
      return value.trim().toLowerCase();
  }
  return undefined;
};

/**
 * Strict credential budget per client IP *and* account: guessing one account's password stays slow, while a
 * whole school behind one NAT address (staff and parents signing in at 8 am) does not share ten attempts.
 * `ipTracker` keeps a looser per-IP cap on top (auth-ip throttler). The subject is hashed, never stored.
 */
export const credentialTracker = (req: CredentialRequest): string => {
  const subject = credentialSubject(req.body);
  if (!subject) return ipTracker(req);
  const digest = createHash('sha256')
    .update(subject)
    .digest('base64url')
    .slice(0, 22);
  return `${ipTracker(req)}:acct:${digest}`;
};
