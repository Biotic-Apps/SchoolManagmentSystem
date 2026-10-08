import type { DeleteStep } from './delete-plan';
import type { RowMarks } from './row-marks';
import { ident, type SqlRunner } from './sql-runner';

/** Executes a delete plan over the marked rows; returns rows deleted per table. */
export async function runDeletes(
  sql: SqlRunner,
  marks: RowMarks,
  steps: DeleteStep[],
): Promise<Record<string, number>> {
  const deleted: Record<string, number> = {};
  for (const step of steps) {
    if (step.kind === 'nullify') {
      const { child, childCols } = step.fk;
      const set = childCols.map((c) => `${ident(c)} = null`).join(', ');
      const anySet = childCols.map((c) => `t.${ident(c)} is not null`);
      await sql.execute(
        `update ${ident(child)} t set ${set} from ${marks.temp(child)} d
         where d.k = ${marks.keyOf(child, 't')} and (${anySet.join(' or ')})`,
      );
      continue;
    }
    deleted[step.table] = await sql.execute(
      `delete from ${ident(step.table)} t using ${marks.temp(step.table)} d
       where d.k = ${marks.keyOf(step.table, 't')}`,
    );
  }
  return deleted;
}
