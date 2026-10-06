import type { ReportColumn, ReportValue } from '../report-table';

/** `123456n` → `"1234.56"` (exact; string arithmetic on minor units). */
export function minorToMajor(value: bigint | number): string {
  const v = BigInt(value);
  const sign = v < 0n ? '-' : '';
  const abs = v < 0n ? -v : v;
  return `${sign}${abs / 100n}.${(abs % 100n).toString().padStart(2, '0')}`;
}

/** Plain text of one cell for CSV and PDF (no thousands separators in CSV). */
export function cellText(column: ReportColumn, value: ReportValue): string {
  if (value === null || value === undefined) return '';
  if (column.kind === 'money' && typeof value !== 'string') {
    return minorToMajor(value);
  }
  if (column.kind === 'percent' && typeof value === 'number') {
    return value.toFixed(1);
  }
  return String(value);
}

/** PDF cells: money with thousands separators. */
export function displayText(column: ReportColumn, value: ReportValue): string {
  const text = cellText(column, value);
  if (column.kind !== 'money' || text === '') return text;
  const [whole, fraction] = text.split('.');
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${fraction}`;
}
