/** Minimal SQL surface the closure needs; backed by a Prisma transaction. */
export interface SqlRunner {
  query<T>(sql: string, ...params: unknown[]): Promise<T[]>;
  execute(sql: string, ...params: unknown[]): Promise<number>;
}

interface RawClient {
  $queryRawUnsafe<T>(sql: string, ...params: unknown[]): Promise<T>;
  $executeRawUnsafe(sql: string, ...params: unknown[]): Promise<number>;
}

export function sqlRunner(db: RawClient): SqlRunner {
  return {
    query: <T>(sql: string, ...params: unknown[]) =>
      db.$queryRawUnsafe<T[]>(sql, ...params),
    execute: (sql: string, ...params: unknown[]) =>
      db.$executeRawUnsafe(sql, ...params),
  };
}

/** Double-quotes a SQL identifier. */
export const ident = (name: string): string => `"${name.replace(/"/g, '""')}"`;
