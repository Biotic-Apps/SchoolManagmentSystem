import type { ForeignKey } from './schema-graph';

export type DeleteStep =
  { kind: 'nullify'; fk: ForeignKey } | { kind: 'delete'; table: string };

/** Only RESTRICT / NO ACTION keys block deleting a parent before its child. */
const blocks = (fk: ForeignKey): boolean =>
  fk.onDelete === 'r' || fk.onDelete === 'a';

/**
 * Orders deletes so children go before their parents. Cycles are cut by
 * clearing a nullable foreign key on the marked child rows first; a cycle of
 * NOT NULL keys cannot be ordered and throws.
 */
export function planDeletes(
  tables: string[],
  foreignKeys: ForeignKey[],
): DeleteStep[] {
  const steps: DeleteStep[] = [];
  const remaining = new Set(tables);
  let edges = foreignKeys.filter(
    (fk) => blocks(fk) && remaining.has(fk.child) && remaining.has(fk.parent),
  );

  // Self references inside one table: clear nullable ones up front.
  for (const fk of edges.filter((e) => e.child === e.parent && e.nullable)) {
    steps.push({ kind: 'nullify', fk });
  }
  edges = edges.filter((e) => e.child !== e.parent);

  while (remaining.size > 0) {
    const ready = [...remaining].filter(
      (table) => !edges.some((e) => e.parent === table),
    );
    if (ready.length > 0) {
      for (const table of ready.sort()) {
        steps.push({ kind: 'delete', table });
        remaining.delete(table);
      }
      edges = edges.filter((e) => remaining.has(e.child));
      continue;
    }
    const cut = edges.find((e) => e.nullable);
    if (!cut) {
      const cycle = [...remaining].sort().join(', ');
      throw new Error(`Cannot order deletes, NOT NULL key cycle in: ${cycle}`);
    }
    steps.push({ kind: 'nullify', fk: cut });
    edges = edges.filter((e) => e !== cut);
  }
  return steps;
}
