import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/** RFC 6238 TOTP: HMAC-SHA1, 6 digits, 30-second steps. */
export const TOTP_STEP_SECONDS = 30;
export const TOTP_DIGITS = 6;
/** Codes of the previous and next step are accepted (clock drift). */
export const TOTP_WINDOW = 1;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const index = ALPHABET.indexOf(char);
    if (index < 0) throw new Error('Invalid base32 character');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** 160-bit secret (RFC 4226 recommendation), base32 for authenticator apps. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function totpStep(nowMs: number = Date.now()): number {
  return Math.floor(nowMs / 1000 / TOTP_STEP_SECONDS);
}

export function hotp(secret: Buffer, counter: number): string {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac('sha1', secret).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    (digest[offset + 1] << 16) |
    (digest[offset + 2] << 8) |
    digest[offset + 3];
  return (binary % 10 ** TOTP_DIGITS).toString().padStart(TOTP_DIGITS, '0');
}

export function totpCode(secretBase32: string, step: number): string {
  return hotp(base32Decode(secretBase32), step);
}

/**
 * Time step the code belongs to (within ±TOTP_WINDOW of `nowMs`), or null.
 * Every candidate is compared in constant time; replay checks are the
 * caller's job (only accept a step greater than the last used one).
 */
export function matchTotpStep(
  secretBase32: string,
  code: string,
  nowMs: number = Date.now(),
): number | null {
  const normalized = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(normalized)) return null;
  const secret = base32Decode(secretBase32);
  const given = Buffer.from(normalized);
  const current = totpStep(nowMs);
  let matched: number | null = null;
  for (let delta = -TOTP_WINDOW; delta <= TOTP_WINDOW; delta++) {
    const expected = Buffer.from(hotp(secret, current + delta));
    if (timingSafeEqual(expected, given) && matched === null) {
      matched = current + delta;
    }
  }
  return matched;
}

export function otpauthUrl(
  issuer: string,
  account: string,
  secretBase32: string,
): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer,
    algorithm: 'SHA1',
    digits: String(TOTP_DIGITS),
    period: String(TOTP_STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
