import { maskPhone } from '../../common/masking';

const MAX_LENGTH = 300;
const PHONE = /\+?\d[\d\s-]{6,}\d/g;
const BEARER = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi;

/**
 * Provider failure safe to store in `lastError` / job runs and to show on
 * Settings › Support: configured secrets and full phone numbers are removed
 * and the text is cut to 300 characters (phase6-contract §A).
 */
export function providerError(
  message: string,
  secrets: (string | undefined)[] = [],
): Error {
  let text = message.replace(/\s+/g, ' ').trim();
  for (const secret of secrets) {
    if (secret && secret.length >= 4) text = text.split(secret).join('***');
  }
  text = text
    .replace(BEARER, '$1 ***')
    .replace(PHONE, (match) => maskPhone(match.replace(/[\s-]/g, '')));
  return new Error(text.slice(0, MAX_LENGTH) || 'Provider error');
}

/** Message of an unknown thrown value. */
export function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
