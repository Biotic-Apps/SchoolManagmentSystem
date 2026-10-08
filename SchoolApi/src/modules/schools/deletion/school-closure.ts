import { expandClosure } from './closure/expand-closure';
import { RowMarks } from './closure/row-marks';
import { loadSchemaGraph } from './closure/schema-graph';
import { ident, type SqlRunner } from './closure/sql-runner';

const SCHOOL_COLUMN = 'school_id';
const STORAGE_COLUMN = 'storage_key';
/** History is kept: audit rows survive the school (they have no FKs). */
const KEPT_TABLES = new Set(['audit_logs']);

export interface SchoolClosure {
  marks: RowMarks;
  removedUserIds: string[];
  keptUserCount: number;
}

/**
 * Marks the school, every row that carries its school_id or depends on one
 * of those rows through a foreign key, and the users that belong only to it.
 * Throws if anything belonging to another school would be included.
 */
export async function markSchoolClosure(
  sql: SqlRunner,
  schoolId: string,
): Promise<SchoolClosure> {
  const graph = await loadSchemaGraph(sql);
  const marks = new RowMarks(sql, graph);
  await marks.markWhere('schools', 't.id = $1::uuid', schoolId);
  for (const table of graph.tables.values()) {
    if (KEPT_TABLES.has(table.name) || !table.columns.has(SCHOOL_COLUMN)) {
      continue;
    }
    await marks.markWhere(table.name, 't.school_id = $1::uuid', schoolId);
  }
  const { removed, kept } = await removableUsers(sql, marks, schoolId);
  if (removed.length > 0) {
    await marks.markWhere('users', 't.id = any($1::uuid[])', removed);
  }
  await expandClosure(marks);
  await assertNoLeak(sql, marks, schoolId);
  return { marks, removedUserIds: removed, keptUserCount: kept };
}

/** Rows marked per table (tables with nothing marked are left out). */
export async function countMarks(
  marks: RowMarks,
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const table of marks.tables()) {
    const n = await marks.count(table);
    if (n > 0) counts[table] = n;
  }
  return counts;
}

/** Storage objects of marked rows, removed after the transaction commits. */
export async function markedStorageKeys(
  sql: SqlRunner,
  marks: RowMarks,
): Promise<string[]> {
  const keys: string[] = [];
  for (const table of marks.tables()) {
    if (!marks.graph.tables.get(table)?.columns.has(STORAGE_COLUMN)) continue;
    const rows = await sql.query<{ key: string }>(
      `select t.${STORAGE_COLUMN} as key from ${ident(table)} t
       ${marks.joinMarked(table, 't')} where t.${STORAGE_COLUMN} is not null`,
    );
    keys.push(...rows.map((row) => row.key));
  }
  return keys;
}

/**
 * Users whose every role assignment is in this school, never super admins,
 * and not referenced by another school's rows (those keep their account and
 * only lose this school's assignments).
 */
async function removableUsers(
  sql: SqlRunner,
  marks: RowMarks,
  schoolId: string,
): Promise<{ removed: string[]; kept: number }> {
  const members = await sql.query<{ id: string; only_here: boolean }>(
    `select ra.user_id::text as id,
       not exists (
         select 1 from role_assignments o left join roles r on r.id = o.role_id
         where o.user_id = ra.user_id
           and (o.school_id is null or o.school_id <> $1::uuid or r.key = 'SUPER_ADMIN')
       ) as only_here
     from role_assignments ra where ra.school_id = $1::uuid group by ra.user_id`,
    schoolId,
  );
  let candidates = members.filter((m) => m.only_here).map((m) => m.id);
  for (const fk of marks.graph.foreignKeys) {
    if (candidates.length === 0) break;
    const child = marks.graph.tables.get(fk.child);
    if (fk.parent !== 'users' || fk.childCols.length !== 1) continue;
    if (!child?.columns.has(SCHOOL_COLUMN)) continue;
    const col = ident(fk.childCols[0]);
    const pinned = await sql.query<{ id: string }>(
      `select distinct t.${col}::text as id from ${ident(fk.child)} t
       where t.${col} = any($2::uuid[])
         and t.school_id is not null and t.school_id <> $1::uuid`,
      schoolId,
      candidates,
    );
    const pinnedIds = new Set(pinned.map((row) => row.id));
    candidates = candidates.filter((id) => !pinnedIds.has(id));
  }
  return { removed: candidates, kept: members.length - candidates.length };
}

async function assertNoLeak(
  sql: SqlRunner,
  marks: RowMarks,
  schoolId: string,
): Promise<void> {
  const leaks: string[] = [];
  for (const table of marks.tables()) {
    if (KEPT_TABLES.has(table)) leaks.push(table);
    if (!marks.graph.tables.get(table)?.columns.has(SCHOOL_COLUMN)) continue;
    const [row] = await sql.query<{ n: number }>(
      `select count(*)::int as n from ${ident(table)} t ${marks.joinMarked(table, 't')}
       where t.school_id is not null and t.school_id <> $1::uuid`,
      schoolId,
    );
    if ((row?.n ?? 0) > 0) leaks.push(`${table} (${row.n})`);
  }
  if (leaks.length > 0) {
    throw new Error(
      `Refusing to delete: rows of other schools would be removed: ${leaks.join(', ')}`,
    );
  }
}
