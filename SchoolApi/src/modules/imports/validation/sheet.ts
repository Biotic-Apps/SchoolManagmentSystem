/** Shared shapes for parsing and validating an import sheet. */

export interface ColumnSpec {
  key: string;
  header: string;
  required: boolean;
  format: string;
  example: string;
}

export interface RowError {
  /** 1-based spreadsheet row (header = 1, first data row = 2). */
  row: number;
  column: string | null;
  message: string;
}

/** A non-empty data row: cell text by column key. */
export interface SheetRow {
  row: number;
  cells: Record<string, string>;
}

export interface ParsedRow<T> {
  row: number;
  /** Normalised values; partial when the row has errors. */
  data: T;
  errors: RowError[];
}

export const MAX_ROWS = 5000;

const headerKey = (value: string) =>
  value
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export interface MappedSheet {
  rows: SheetRow[];
  /** File-level problems (missing columns, too many rows, empty). */
  errors: RowError[];
}

/**
 * Maps the header row onto the column specs (case/spacing-insensitive, by
 * key or header), drops empty rows and enforces the row limit.
 */
export function mapSheet(grid: string[][], columns: ColumnSpec[]): MappedSheet {
  const header = (grid[0] ?? []).map(headerKey);
  const index = new Map<string, number>();
  for (const column of columns) {
    const at = header.findIndex(
      (cell) =>
        cell === headerKey(column.key) || cell === headerKey(column.header),
    );
    if (at >= 0) index.set(column.key, at);
  }
  const missing = columns.filter((c) => c.required && !index.has(c.key));
  if (missing.length > 0) {
    return {
      rows: [],
      errors: missing.map((c) => ({
        row: 1,
        column: c.header,
        message: `Required column "${c.header}" is missing`,
      })),
    };
  }
  const rows: SheetRow[] = [];
  for (let i = 1; i < grid.length; i++) {
    const line = grid[i] ?? [];
    if (line.every((cell) => (cell ?? '').trim() === '')) continue;
    const cells: Record<string, string> = {};
    for (const column of columns) {
      const at = index.get(column.key);
      cells[column.key] = at === undefined ? '' : (line[at] ?? '').trim();
    }
    rows.push({ row: i + 1, cells });
  }
  if (rows.length === 0) {
    return {
      rows,
      errors: [{ row: 1, column: null, message: 'The file has no data rows' }],
    };
  }
  if (rows.length > MAX_ROWS) {
    return {
      rows: [],
      errors: [
        {
          row: rows[MAX_ROWS].row,
          column: null,
          message: `At most ${MAX_ROWS} rows per import`,
        },
      ],
    };
  }
  return { rows, errors: [] };
}

/** Collects per-cell errors while a row is parsed. */
export class RowBuilder {
  readonly errors: RowError[] = [];

  constructor(
    private readonly source: SheetRow,
    private readonly columns: ColumnSpec[],
  ) {}

  get row(): number {
    return this.source.row;
  }

  raw(key: string): string {
    return this.source.cells[key] ?? '';
  }

  error(key: string | null, message: string): void {
    const header = this.columns.find((c) => c.key === key)?.header ?? key;
    this.errors.push({ row: this.source.row, column: header, message });
  }

  /** Required: blank → error. Returns undefined on error. */
  need<T>(
    key: string,
    parse: (raw: string) => { value: T } | { error: string },
  ): T | undefined {
    const raw = this.raw(key);
    if (raw === '') {
      this.error(key, 'Required');
      return undefined;
    }
    return this.take(key, raw, parse);
  }

  /** Optional: blank → null. */
  maybe<T>(
    key: string,
    parse: (raw: string) => { value: T } | { error: string },
  ): T | null | undefined {
    const raw = this.raw(key);
    return raw === '' ? null : this.take(key, raw, parse);
  }

  private take<T>(
    key: string,
    raw: string,
    parse: (raw: string) => { value: T } | { error: string },
  ): T | undefined {
    const result = parse(raw);
    if ('error' in result && result.error !== undefined) {
      this.error(key, result.error);
      return undefined;
    }
    return (result as { value: T }).value;
  }

  done<T>(data: T): ParsedRow<T> {
    return { row: this.source.row, data, errors: this.errors };
  }
}

/** Flags the second and later rows that share a key. */
export function flagDuplicates<T>(
  rows: ParsedRow<T>[],
  keyOf: (data: T) => string | null | undefined,
  column: string,
  label: string,
): void {
  const seen = new Map<string, number>();
  for (const row of rows) {
    const key = keyOf(row.data);
    if (!key) continue;
    const first = seen.get(key);
    if (first !== undefined) {
      row.errors.push({
        row: row.row,
        column,
        message: `Duplicate ${label} (same as row ${first})`,
      });
    } else {
      seen.set(key, row.row);
    }
  }
}

export const addError = <T>(
  row: ParsedRow<T>,
  column: string | null,
  message: string,
) => row.errors.push({ row: row.row, column, message });

export const isValid = <T>(row: ParsedRow<T>) => row.errors.length === 0;
