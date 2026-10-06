/** Double-quotes a SQL identifier. */
export const quoteIdent = (name: string): string =>
  `"${name.replace(/"/g, '""')}"`;

/**
 * Session settings for COPY text dumps and restores, so values are written
 * and parsed the same way regardless of server defaults.
 */
export const COPY_SESSION_SQL = [
  `SET DateStyle = 'ISO, YMD'`,
  `SET IntervalStyle = 'postgres'`,
  `SET TimeZone = 'UTC'`,
  `SET extra_float_digits = 3`,
  `SET bytea_output = 'hex'`,
  `SET client_encoding = 'UTF8'`,
].join('; ');
