import { randomInt, timingSafeEqual } from 'node:crypto';

/** phase6-contract §B: 6 digits, 5 minutes, 5 attempts, 60 s resend cooldown. */
export const OTP_TTL_MS = 5 * 60_000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_SECONDS = 60;
/**
 * Email-code lock (separate from the account lockout, so a stranger who only
 * knows an email cannot block the parent's password sign-in): this many wrong
 * codes for one email within the window stop new codes and verification for
 * that email until the window passes.
 */
export const OTP_LOCK_FAILURES = 10;
export const OTP_LOCK_WINDOW_MS = 30 * 60_000;

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

/** Spaces are ignored; anything but 6 digits can never match. */
export function normalizeOtpCode(input: string): string | null {
  const value = input.replace(/\s/g, '');
  return /^\d{6}$/.test(value) ? value : null;
}

/** HMAC input: the row id binds the code to one issued row. */
export const otpHashInput = (id: string, code: string) =>
  `login-otp:${id}:${code}`;

/** Constant-time comparison of two hex hashes. */
export function sameHash(a: string | null, b: string): boolean {
  if (a === null || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
