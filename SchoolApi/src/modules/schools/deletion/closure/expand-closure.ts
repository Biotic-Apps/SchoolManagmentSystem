import type { RowMarks } from './row-marks';

/** Safety cap: the FK graph is far shallower than this. */
const MAX_PASSES = 100;

/**
 * Follows every foreign key from marked parents to their children until a
 * full pass marks nothing new (fixpoint). Returns the number of passes.
 */
export async function expandClosure(marks: RowMarks): Promise<number> {
  for (let pass = 1; pass <= MAX_PASSES; pass++) {
    let added = 0;
    for (const fk of marks.graph.foreignKeys) {
      if (marks.has(fk.parent)) added += await marks.markChildren(fk);
    }
    if (added === 0) return pass;
  }
  throw new Error(`Dependency closure did not settle in ${MAX_PASSES} passes`);
}
