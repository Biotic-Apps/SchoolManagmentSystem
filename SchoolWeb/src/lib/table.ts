/** Column class for numbers and money: right-aligned header and cells, fixed-width digits. */
export const NUMERIC_COLUMN = "text-right tabular-nums";

/** Drops columns whose cells are empty in every row (e.g. no section has a room), keeping `keep` ids. */
export function withoutEmptyColumns<T, C extends { id: string }>(
  columns: C[],
  rows: T[],
  isEmpty: (columnId: string, row: T) => boolean,
  keep: string[] = [],
): C[] {
  if (rows.length === 0) return columns;
  return columns.filter((column) => keep.includes(column.id) || rows.some((row) => !isEmpty(column.id, row)));
}
