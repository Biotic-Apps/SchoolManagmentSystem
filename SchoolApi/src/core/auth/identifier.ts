export interface Identifier {
  email?: string;
  phone?: string;
}

/** Email when it contains `@`, otherwise a phone number without separators. */
export function parseIdentifier(raw: string): Identifier {
  const value = raw.trim();
  if (value.includes('@')) return { email: value.toLowerCase() };
  return { phone: normalizePhone(value) };
}

export function normalizePhone(value: string): string {
  return value.replace(/[\s()-]/g, '');
}
