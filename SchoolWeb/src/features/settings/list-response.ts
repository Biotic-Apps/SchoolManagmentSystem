import type { ApiResult, PageMeta } from "@/lib/envelope";

export interface NormalisedList<T> {
  rows: T[];
  meta?: PageMeta;
}

type Wrapped<T> = T[] | { items?: T[]; rows?: T[]; data?: T[]; meta?: PageMeta } | null | undefined;

/** Accepts a plain array or a paged payload and returns rows plus meta when the API sends it. */
export function normaliseList<T>(result: ApiResult<Wrapped<T>>): NormalisedList<T> {
  const data = result.data;
  if (Array.isArray(data)) return { rows: data, meta: result.meta };
  return { rows: data?.items ?? data?.rows ?? data?.data ?? [], meta: result.meta ?? data?.meta };
}
