/** How a column is formatted: money values are bigint minor units. */
export type ColumnKind = 'text' | 'int' | 'money' | 'percent' | 'date';

export interface ReportColumn {
  key: string;
  header: string;
  kind?: ColumnKind;
}

export type ReportValue = string | number | bigint | null;
export type ReportRow = Record<string, ReportValue>;

/** What every report query returns; rendered to CSV, XLSX or PDF. */
export interface ReportTable {
  title: string;
  columns: ReportColumn[];
  rows: ReportRow[];
}

/** Percent with one decimal, `null` when there is no base. */
export function percent(part: number, whole: number): number | null {
  if (whole <= 0) return null;
  return Math.round((part * 1000) / whole) / 10;
}
