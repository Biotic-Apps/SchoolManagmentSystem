export interface Identifier {
  email?: string;
  phone?: string;
  /** A child's admission number: signs in that child's parent. */
  admissionNo?: string;
}

/**
 * Email when it contains `@`; a child's admission number (e.g. SMS-2026-0002)
 * when it contains a letter; otherwise a phone number without separators.
 */
export function parseIdentifier(raw: string): Identifier {
  const value = raw.trim();
  if (value.includes('@')) return { email: value.toLowerCase() };
  if (/[a-z]/i.test(value)) return { admissionNo: value.toUpperCase() };
  return { phone: normalizePhone(value) };
}

export function normalizePhone(value: string): string {
  return value.replace(/[\s()-]/g, '');
}
