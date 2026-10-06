/**
 * Pure field parsers for spreadsheet cells. Each returns `{ value }` or
 * `{ error }` (a human message shown next to the row and column).
 */
export type Parsed<T> = { value: T; error?: undefined } | { error: string };

const ok = <T>(value: T): Parsed<T> => ({ value });
const fail = (error: string): Parsed<never> => ({ error });

/** Pakistani mobile numbers → `+92XXXXXXXXXX`. */
export function parsePhone(raw: string): Parsed<string> {
  const compact = raw.replace(/[\s().-]/g, '');
  let national: string | null = null;
  if (/^\+92\d+$/.test(compact)) national = compact.slice(3);
  else if (/^0092\d+$/.test(compact)) national = compact.slice(4);
  else if (/^92\d{10}$/.test(compact)) national = compact.slice(2);
  else if (/^0\d+$/.test(compact)) national = compact.slice(1);
  else if (/^\d{10}$/.test(compact)) national = compact;
  if (national === null || !/^3\d{9}$/.test(national)) {
    return fail('Phone must be a Pakistani mobile number like 03001234567');
  }
  return ok(`+92${national}`);
}

/** Variants a phone may have been stored as by older screens. */
export function phoneVariants(normalised: string): string[] {
  const national = normalised.replace(/^\+92/, '');
  return [normalised, `0${national}`, `92${national}`, `0092${national}`];
}

/** 13 digits with or without dashes → `12345-1234567-1`. */
export function parseCnic(raw: string): Parsed<string> {
  const compact = raw.replace(/\s/g, '');
  if (!/^\d{5}-?\d{7}-?\d$/.test(compact)) {
    return fail('CNIC must have 13 digits, e.g. 12345-1234567-1');
  }
  const d = compact.replace(/-/g, '');
  return ok(`${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`);
}

function isoDate(year: number, month: number, day: number): string | null {
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1) {
    return null;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

/** `YYYY-MM-DD` or `DD/MM/YYYY` (real calendar dates only) → `YYYY-MM-DD`. */
export function parseDateCell(raw: string): Parsed<string> {
  const value = raw.trim();
  let match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
  let iso: string | null = null;
  if (match) iso = isoDate(+match[1], +match[2], +match[3]);
  match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (match) iso = isoDate(+match[3], +match[2], +match[1]);
  return iso
    ? ok(iso)
    : fail('Date must be a real date as YYYY-MM-DD or DD/MM/YYYY');
}

const NAME = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;

/** Unicode letters (Urdu included), spaces and . ' - ; at most 100 chars. */
export function parseName(raw: string): Parsed<string> {
  const value = raw.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (value.length > 100) return fail('Name must be at most 100 characters');
  if (!NAME.test(value)) {
    return fail("Name may contain only letters, spaces and . ' -");
  }
  return ok(value);
}

/** Major units with up to 2 decimals → positive minor units. */
export function parseAmount(raw: string): Parsed<number> {
  const value = raw.replace(/[,\s]/g, '');
  if (value.startsWith('-')) {
    return fail('Negative amount is an advance credit: record as a payment');
  }
  const match = /^(\d{1,13})(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return fail('Amount must be a number with up to 2 decimals');
  const minor =
    Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  if (minor <= 0) return fail('Amount must be greater than 0');
  return ok(minor);
}

const YES = new Set(['yes', 'y', 'true', '1', 'haan', 'ہاں']);
const NO = new Set(['no', 'n', 'false', '0', '', 'نہیں']);

export function parseYesNo(raw: string): Parsed<boolean> {
  const value = raw.trim().toLowerCase();
  if (YES.has(value)) return ok(true);
  if (NO.has(value)) return ok(false);
  return fail('Use yes or no');
}

export function parseEmail(raw: string): Parsed<string> {
  const value = raw.trim().toLowerCase();
  if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return fail('Email address is not valid');
  }
  return ok(value);
}

/** Case-insensitive match against allowed values (plus aliases). */
export function parseEnum<T extends string>(
  raw: string,
  allowed: readonly T[],
  aliases: Record<string, T> = {},
): Parsed<T> {
  const key = raw
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  const found = allowed.find((item) => item === key) ?? aliases[key];
  return found ? ok(found) : fail(`Must be one of ${allowed.join(', ')}`);
}

export function parseInteger(
  raw: string,
  min: number,
  max: number,
): Parsed<number> {
  const value = raw.trim();
  if (!/^\d+$/.test(value) || +value < min || +value > max) {
    return fail(`Must be a whole number from ${min} to ${max}`);
  }
  return ok(Number(value));
}

/** Free text: trimmed, single-line, length-limited. */
export function parseText(raw: string, max: number): Parsed<string> {
  const value = raw.replace(/\s+/g, ' ').trim();
  return value.length > max
    ? fail(`Must be at most ${max} characters`)
    : ok(value);
}
