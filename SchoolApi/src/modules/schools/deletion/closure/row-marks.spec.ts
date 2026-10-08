import { RowMarks } from './row-marks';
import type { ForeignKey, SchemaGraph, TableInfo } from './schema-graph';
import type { SqlRunner } from './sql-runner';

const table = (
  name: string,
  pk: string[],
  columns: string[] = pk,
): [string, TableInfo] => [name, { name, pk, columns: new Set(columns) }];

const graph: SchemaGraph = {
  tables: new Map([
    table('schools', ['id']),
    table('branches', ['id'], ['id', 'school_id']),
    table('perms', ['role_id', 'key']),
    table('heap', []),
  ]),
  foreignKeys: [],
};

const fk = (over: Partial<ForeignKey>): ForeignKey => ({
  child: 'branches',
  parent: 'schools',
  childCols: ['school_id'],
  parentCols: ['id'],
  nullable: false,
  onDelete: 'r',
  ...over,
});

function runner() {
  const calls: string[] = [];
  const sql: SqlRunner = {
    query: <T>() => Promise.resolve([{ n: 4 }] as T[]),
    execute: (text: string) => {
      calls.push(text.replace(/\s+/g, ' ').trim());
      return Promise.resolve(2);
    },
  };
  return { sql, calls };
}

describe('RowMarks', () => {
  it('creates one temp table per table and keys rows by primary key', async () => {
    const { sql, calls } = runner();
    const marks = new RowMarks(sql, graph);
    await marks.markWhere('schools', 't.id = $1', 'S');
    await marks.markWhere('schools', 't.code = $1', 'X');
    expect(calls[0]).toBe(
      'create temp table purge_mark_0 (k jsonb primary key) on commit drop',
    );
    expect(calls[1]).toContain(
      'insert into purge_mark_0 (k) select jsonb_build_array(t."id") from "schools" t where t.id = $1',
    );
    expect(calls).toHaveLength(3);
    expect(marks.tables()).toEqual(['schools']);
    expect(marks.keyOf('perms', 'p')).toBe(
      'jsonb_build_array(p."role_id", p."key")',
    );
    await expect(marks.count('schools')).resolves.toBe(4);
  });

  it('marks children straight from the parent key when the FK targets it', async () => {
    const { sql, calls } = runner();
    const marks = new RowMarks(sql, graph);
    await marks.markWhere('schools', 'true');
    await expect(marks.markChildren(fk({}))).resolves.toBe(2);
    expect(calls.at(-1)).toContain(
      'from "branches" t join purge_mark_0 d on d.k = jsonb_build_array(t."school_id")',
    );
  });

  it('joins the parent table when the FK targets a non-key column', async () => {
    const { sql, calls } = runner();
    const marks = new RowMarks(sql, graph);
    await marks.markWhere('perms', 'true');
    await marks.markChildren(fk({ parent: 'perms', parentCols: ['key'] }));
    expect(calls.at(-1)).toContain(
      'join "perms" p on t."school_id" = p."key" join purge_mark_0 d on d.k = jsonb_build_array(p."role_id", p."key")',
    );
  });

  it('skips unmarked parents and refuses tables without a key', async () => {
    const { sql } = runner();
    const marks = new RowMarks(sql, graph);
    await expect(marks.markChildren(fk({}))).resolves.toBe(0);
    await expect(marks.markWhere('heap', 'true')).rejects.toThrow(
      /no primary key/,
    );
    await expect(marks.count('schools')).rejects.toThrow(/no marked rows/);
  });
});
