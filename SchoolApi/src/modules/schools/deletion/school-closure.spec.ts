import type { SqlRunner } from './closure/sql-runner';
import { markSchoolClosure } from './school-closure';

const SCHOOL = '00000000-0000-0000-0000-00000000000a';

const TABLES = [
  { name: 'schools', pk: ['id'], columns: ['id', 'code'] },
  { name: 'users', pk: ['id'], columns: ['id'] },
  { name: 'staff', pk: ['id'], columns: ['id', 'school_id', 'user_id'] },
  { name: 'files', pk: ['id'], columns: ['id', 'school_id', 'uploaded_by_id'] },
  { name: 'audit_logs', pk: ['id', 'at'], columns: ['id', 'at', 'school_id'] },
];
const FKS = [
  ['staff', 'schools', 'school_id'],
  ['staff', 'users', 'user_id'],
  ['files', 'users', 'uploaded_by_id'],
].map(([child, parent, col]) => ({
  child,
  parent,
  child_cols: [col],
  parent_cols: ['id'],
  nullable: false,
  on_delete: 'r',
}));

interface Fake {
  members?: { id: string; only_here: boolean }[];
  pinnedBy?: Record<string, string[]>;
  leaks?: Record<string, number>;
}

function fakeSql(fake: Fake) {
  const executed: { text: string; params: unknown[] }[] = [];
  const query = (text: string, ...params: unknown[]): unknown[] => {
    if (text.includes('from pg_class c')) return TABLES;
    if (text.includes('from pg_constraint f')) return FKS;
    if (text.includes('only_here')) return fake.members ?? [];
    if (text.includes('any($2::uuid[])')) {
      const table = /from "(\w+)" t/.exec(text)?.[1] ?? '';
      const ids = params[1] as string[];
      const pinned = fake.pinnedBy?.[table] ?? [];
      return pinned.filter((id) => ids.includes(id)).map((id) => ({ id }));
    }
    const leak = /count\(\*\)::int as n from "(\w+)"/.exec(text);
    if (leak) return [{ n: fake.leaks?.[leak[1]] ?? 0 }];
    return [];
  };
  const sql: SqlRunner = {
    query: <T>(text: string, ...params: unknown[]) =>
      Promise.resolve(query(text, ...params) as T[]),
    execute: (text: string, ...params: unknown[]) => {
      executed.push({ text, params });
      // Seeds mark rows; following keys finds nothing new (one pass).
      return Promise.resolve(text.includes(' where ') ? 1 : 0);
    },
  };
  return { sql, executed };
}

const seeded = (executed: { text: string; params: unknown[] }[]) =>
  executed
    .filter((e) => e.text.startsWith('insert') && e.text.includes(' where '))
    .map((e) => /from "(\w+)" t/.exec(e.text)?.[1]);

describe('markSchoolClosure', () => {
  it('seeds the school, its school_id rows (not audit) and its own users', async () => {
    const { sql, executed } = fakeSql({
      members: [
        { id: 'only-here', only_here: true },
        { id: 'pinned', only_here: true },
        { id: 'elsewhere', only_here: false },
      ],
      pinnedBy: { files: ['pinned'] },
    });

    const closure = await markSchoolClosure(sql, SCHOOL);

    expect(seeded(executed)).toEqual(['schools', 'staff', 'files', 'users']);
    const userSeed = executed.find((e) => e.text.includes('from "users" t'));
    expect(userSeed?.params).toEqual([['only-here']]);
    expect(closure.removedUserIds).toEqual(['only-here']);
    expect(closure.keptUserCount).toBe(2);
    expect(closure.marks.tables()).not.toContain('audit_logs');
  });

  it('marks no users when every member belongs elsewhere too', async () => {
    const { sql, executed } = fakeSql({
      members: [{ id: 'u', only_here: false }],
    });
    const closure = await markSchoolClosure(sql, SCHOOL);
    expect(seeded(executed)).not.toContain('users');
    expect(closure.removedUserIds).toEqual([]);
  });

  it('refuses when rows of another school would be included', async () => {
    const { sql } = fakeSql({ leaks: { staff: 2 } });
    await expect(markSchoolClosure(sql, SCHOOL)).rejects.toThrow(
      'rows of other schools would be removed: staff (2)',
    );
  });
});
