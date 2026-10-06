import type { KindHandler } from '../kinds/import-kinds';
import type { Db, ImportTarget } from '../kinds/kind-handler';
import type { ParsedRow, RowError, SheetRow } from '../validation/sheet';

export type StoredRow = ParsedRow<Record<string, unknown>>;

/** parse → DB lookups → cross-row/DB checks. */
export async function validateRows(
  handler: KindHandler,
  rows: SheetRow[],
  db: Db,
  target: ImportTarget,
): Promise<StoredRow[]> {
  const parsed = rows.map((row) => handler.validator.parse(row));
  const ctx = await handler.validator.loadContext(db, target, parsed);
  handler.validator.check(parsed, ctx);
  return parsed as StoredRow[];
}

/**
 * Re-checks the stored valid rows against the DB as it is now (inside the
 * commit transaction). Returns the fresh rows and the context.
 */
export async function recheckRows(
  handler: KindHandler,
  stored: StoredRow[],
  db: Db,
  target: ImportTarget,
): Promise<{ rows: StoredRow[]; ctx: unknown; errors: RowError[] }> {
  const rows: StoredRow[] = stored
    .filter((row) => row.errors.length === 0)
    .map((row) => ({ row: row.row, data: { ...row.data }, errors: [] }));
  const ctx = await handler.validator.loadContext(db, target, rows);
  handler.validator.check(rows, ctx);
  return { rows, ctx, errors: rows.flatMap((row) => row.errors) };
}

export interface Totals {
  rows: number;
  valid: number;
  invalid: number;
}

export function totalsOf(rows: StoredRow[]): Totals {
  const invalid = rows.filter((row) => row.errors.length > 0).length;
  return { rows: rows.length, valid: rows.length - invalid, invalid };
}

const INTERNAL = /Id$/;

function previewValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        item && typeof item === 'object'
          ? Object.entries(item as Record<string, unknown>)
              .filter(
                ([k, v]) => !INTERNAL.test(k) && v !== null && v !== undefined,
              )
              .map(([, v]) => String(v))
              .join(':')
          : String(item),
      )
      .join('; ');
  }
  return value;
}

/** First 20 rows for display: row number, validity, public fields flattened. */
export function previewOf(rows: StoredRow[]): Record<string, unknown>[] {
  return rows.slice(0, 20).map((row) => {
    const out: Record<string, unknown> = {
      row: row.row,
      valid: row.errors.length === 0,
    };
    for (const [key, value] of Object.entries(row.data)) {
      if (INTERNAL.test(key) || value === undefined) continue;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          out[`${key}${k[0].toUpperCase()}${k.slice(1)}`] = v;
        }
      } else {
        out[key] = previewValue(value);
      }
    }
    return out;
  });
}
