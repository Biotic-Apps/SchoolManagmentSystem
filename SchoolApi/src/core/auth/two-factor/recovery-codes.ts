import { randomBytes } from 'node:crypto';
import { base32Encode } from './totp';

export const RECOVERY_CODE_COUNT = 10;

/** `xxxxx-xxxxx` from 50 random bits (base32, lower-case for readability). */
export function generateRecoveryCode(): string {
  const raw = base32Encode(randomBytes(7)).slice(0, 10).toLowerCase();
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
}

export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): string[] {
  const codes = new Set<string>();
  while (codes.size < count) codes.add(generateRecoveryCode());
  return [...codes];
}

/** Canonical form that is hashed: case, spaces and dashes are ignored. */
export function normalizeRecoveryCode(input: string): string | null {
  const value = input.toLowerCase().replace(/[\s-]/g, '');
  return /^[a-z2-7]{10}$/.test(value) ? value : null;
}

export function looksLikeTotp(input: string): boolean {
  return /^\d{6}$/.test(input.replace(/\s/g, ''));
}
