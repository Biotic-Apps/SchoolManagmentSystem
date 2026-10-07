/**
 * E.164 normalisation (phase6-contract §A). Numbers without a country code
 * get `defaultCountry` (env DEFAULT_PHONE_COUNTRY, e.g. `+92`): a leading
 * national `0` is dropped, `00` is read as `+`. Returns null when the result
 * is not 8–15 digits.
 */
export function toE164(raw: string, defaultCountry: string): string | null {
  const compact = raw.trim().replace(/[\s().-]/g, '');
  const country = defaultCountry.replace('+', '');
  let digits: string;
  if (/^\+\d+$/.test(compact)) digits = compact.slice(1);
  else if (/^00\d+$/.test(compact)) digits = compact.slice(2);
  else if (/^0\d+$/.test(compact)) digits = country + compact.slice(1);
  else if (/^\d+$/.test(compact)) {
    // Already international when it starts with the country code and is long enough.
    digits =
      compact.startsWith(country) && compact.length > 10
        ? compact
        : country + compact;
  } else return null;
  return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
}

/** Forms a number may have been stored in by older screens and imports. */
export function phoneVariants(e164: string, defaultCountry: string): string[] {
  if (!e164.startsWith(defaultCountry)) return [e164];
  const national = e164.slice(defaultCountry.length);
  const country = defaultCountry.slice(1);
  return [
    e164,
    `0${national}`,
    `${country}${national}`,
    `00${country}${national}`,
  ];
}
