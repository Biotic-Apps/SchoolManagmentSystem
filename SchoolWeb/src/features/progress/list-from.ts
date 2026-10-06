/** Lists may come as a plain array or wrapped (`{ items }`, `{ entries }`, `{ notes }`). */
export function listFrom<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["items", "entries", "notes", "data"]) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
}
