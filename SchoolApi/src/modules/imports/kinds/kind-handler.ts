import type { ImportKind, Prisma } from '../../../generated/prisma/client';
import type { ColumnSpec, ParsedRow, SheetRow } from '../validation/sheet';

export type Db = Prisma.TransactionClient;

/** Where an import lands and who runs it. */
export interface ImportTarget {
  importId: string;
  schoolId: string;
  schoolCode: string;
  branchId: string;
  sessionId: string;
  actorId: string;
}

/** Pure parsing/checking per kind plus the DB lookups the checks need. */
export interface KindValidator<T, C> {
  readonly kind: ImportKind;
  readonly columns: ColumnSpec[];
  /** Extra lines for the template's Instructions sheet. */
  readonly notes: string[];
  parse(row: SheetRow): ParsedRow<T>;
  loadContext(db: Db, target: ImportTarget, rows: ParsedRow<T>[]): Promise<C>;
  /** Cross-row and against-DB checks; appends errors to the rows. */
  check(rows: ParsedRow<T>[], ctx: C): void;
}

export interface CommitResult {
  /** Ids per entity, stored in `ImportBatch.created` for revert. */
  created: Record<string, unknown>;
  reconciliation?: Record<string, unknown>;
  /** Logins whose access cache must be refreshed after commit. */
  userIds?: string[];
}

/** Applies valid rows inside the caller's transaction and undoes them. */
export interface KindCommitter<T, C> {
  readonly kind: ImportKind;
  commit(
    tx: Db,
    target: ImportTarget,
    rows: ParsedRow<T>[],
    ctx: C,
  ): Promise<CommitResult>;
  /** Throws 409 (with details) when anything references the created rows. */
  revert(
    tx: Db,
    target: ImportTarget,
    created: Record<string, unknown>,
  ): Promise<{ userIds?: string[] }>;
}

export const ids = (created: Record<string, unknown>, key: string): string[] =>
  Array.isArray(created[key]) ? (created[key] as string[]) : [];
