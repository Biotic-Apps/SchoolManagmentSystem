import type { PageMeta } from "./envelope";

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export function pageCount({ pageSize, total }: PaginationState): number {
  return Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
}

export function rangeLabel({ page, pageSize, total }: PaginationState): string {
  if (total === 0) return "0 results";
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return `${from}–${to} of ${total}`;
}

/** Table pagination props from API meta; undefined when the list is not paginated. */
export function paginationFrom(meta: PageMeta | undefined, onPageChange: (page: number) => void) {
  if (!meta) return undefined;
  return { ...meta, onPageChange };
}
