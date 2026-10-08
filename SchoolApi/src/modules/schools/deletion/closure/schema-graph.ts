import type { SqlRunner } from './sql-runner';

export interface TableInfo {
  name: string;
  /** Primary key columns in index order. */
  pk: string[];
  columns: Set<string>;
}

export interface ForeignKey {
  child: string;
  parent: string;
  childCols: string[];
  parentCols: string[];
  /** All child columns may be NULL (the edge can be cut before deleting). */
  nullable: boolean;
  /** Postgres confdeltype: a=no action, r=restrict, c=cascade, n=set null, d=set default. */
  onDelete: string;
}

export interface SchemaGraph {
  tables: Map<string, TableInfo>;
  foreignKeys: ForeignKey[];
}

interface TableRow {
  name: string;
  pk: string[] | null;
  columns: string[];
}

interface FkRow {
  child: string;
  parent: string;
  child_cols: string[];
  parent_cols: string[];
  nullable: boolean;
  on_delete: string;
}

const TABLES_SQL = `
select c.relname as name,
  (select array_agg(a.attname::text order by k.i)
     from pg_index x
     cross join unnest(x.indkey) with ordinality k(n, i)
     join pg_attribute a on a.attrelid = x.indrelid and a.attnum = k.n
    where x.indrelid = c.oid and x.indisprimary) as pk,
  (select array_agg(a.attname::text) from pg_attribute a
    where a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped) as columns
from pg_class c
where c.relnamespace = current_schema()::regnamespace
  and c.relkind in ('r', 'p') and not c.relispartition`;

const FKS_SQL = `
select ch.relname as child, pa.relname as parent,
  array(select a.attname::text from unnest(f.conkey) with ordinality k(n, i)
    join pg_attribute a on a.attrelid = f.conrelid and a.attnum = k.n order by k.i) as child_cols,
  array(select a.attname::text from unnest(f.confkey) with ordinality k(n, i)
    join pg_attribute a on a.attrelid = f.confrelid and a.attnum = k.n order by k.i) as parent_cols,
  not exists (select 1 from unnest(f.conkey) k(n)
    join pg_attribute a on a.attrelid = f.conrelid and a.attnum = k.n where a.attnotnull) as nullable,
  f.confdeltype::text as on_delete
from pg_constraint f
join pg_class ch on ch.oid = f.conrelid
join pg_class pa on pa.oid = f.confrelid
where f.contype = 'f' and f.conparentid = 0
  and ch.relnamespace = current_schema()::regnamespace
  and pa.relnamespace = current_schema()::regnamespace
  and not ch.relispartition`;

/** Reads tables and foreign keys from pg_catalog, so new tables are covered automatically. */
export async function loadSchemaGraph(sql: SqlRunner): Promise<SchemaGraph> {
  // Sequential: both run on the same transaction connection.
  const tableRows = await sql.query<TableRow>(TABLES_SQL);
  const fkRows = await sql.query<FkRow>(FKS_SQL);
  const tables = new Map<string, TableInfo>();
  for (const row of tableRows) {
    tables.set(row.name, {
      name: row.name,
      pk: row.pk ?? [],
      columns: new Set(row.columns ?? []),
    });
  }
  const foreignKeys = fkRows.map((row) => ({
    child: row.child,
    parent: row.parent,
    childCols: row.child_cols,
    parentCols: row.parent_cols,
    nullable: row.nullable,
    onDelete: row.on_delete,
  }));
  return { tables, foreignKeys };
}
