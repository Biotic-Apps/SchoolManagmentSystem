import type { ForeignKey, SchemaGraph, TableInfo } from './schema-graph';
import { ident, type SqlRunner } from './sql-runner';

/**
 * Rows selected for deletion, per table, kept in temp tables of primary keys
 * (as jsonb arrays, so any key shape works). Dropped when the transaction ends.
 */
export class RowMarks {
  private readonly temps = new Map<string, string>();

  constructor(
    private readonly sql: SqlRunner,
    readonly graph: SchemaGraph,
  ) {}

  tables(): string[] {
    return [...this.temps.keys()];
  }

  has(table: string): boolean {
    return this.temps.has(table);
  }

  /** `jsonb_build_array(alias."pk1", …)` for the table's primary key. */
  keyOf(table: string, alias: string): string {
    return this.keyCols(alias, this.info(table).pk);
  }

  /** Join clause selecting only marked rows of `table` aliased as `alias`. */
  joinMarked(table: string, alias: string, markAlias = 'd'): string {
    return `join ${this.temp(table)} ${markAlias} on ${markAlias}.k = ${this.keyOf(table, alias)}`;
  }

  /** Marks rows of `table` (aliased `t`) matching `where`. */
  async markWhere(
    table: string,
    where: string,
    ...params: unknown[]
  ): Promise<number> {
    const temp = await this.ensure(table);
    return this.sql.execute(
      `insert into ${temp} (k) select ${this.keyOf(table, 't')} from ${ident(table)} t
       where ${where} on conflict do nothing`,
      ...params,
    );
  }

  /** Marks rows of fk.child that reference marked rows of fk.parent. */
  async markChildren(fk: ForeignKey): Promise<number> {
    const parentTemp = this.temps.get(fk.parent);
    if (!parentTemp) return 0;
    const temp = await this.ensure(fk.child);
    const parent = this.info(fk.parent);
    const viaKey = sameList(fk.parentCols, parent.pk);
    const source = viaKey
      ? `join ${parentTemp} d on d.k = ${this.keyCols('t', fk.childCols)}`
      : `join ${ident(fk.parent)} p on ${fk.childCols
          .map((c, i) => `t.${ident(c)} = p.${ident(fk.parentCols[i])}`)
          .join(' and ')} ${this.joinMarked(fk.parent, 'p')}`;
    return this.sql.execute(
      `insert into ${temp} (k) select ${this.keyOf(fk.child, 't')}
       from ${ident(fk.child)} t ${source} on conflict do nothing`,
    );
  }

  async count(table: string): Promise<number> {
    const [row] = await this.sql.query<{ n: number }>(
      `select count(*)::int as n from ${this.temp(table)}`,
    );
    return row?.n ?? 0;
  }

  temp(table: string): string {
    const temp = this.temps.get(table);
    if (!temp) throw new Error(`${table} has no marked rows`);
    return temp;
  }

  private async ensure(table: string): Promise<string> {
    const existing = this.temps.get(table);
    if (existing) return existing;
    if (this.info(table).pk.length === 0) {
      throw new Error(`${table} has no primary key; cannot purge it safely`);
    }
    const temp = `purge_mark_${this.temps.size}`;
    await this.sql.execute(
      `create temp table ${temp} (k jsonb primary key) on commit drop`,
    );
    this.temps.set(table, temp);
    return temp;
  }

  private keyCols(alias: string, cols: string[]): string {
    return `jsonb_build_array(${cols.map((c) => `${alias}.${ident(c)}`).join(', ')})`;
  }

  private info(table: string): TableInfo {
    const info = this.graph.tables.get(table);
    if (!info) throw new Error(`Unknown table ${table}`);
    return info;
  }
}

function sameList(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}
