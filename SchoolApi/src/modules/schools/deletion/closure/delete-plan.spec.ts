import { planDeletes } from './delete-plan';
import type { ForeignKey } from './schema-graph';

const fk = (
  child: string,
  parent: string,
  over: Partial<ForeignKey> = {},
): ForeignKey => ({
  child,
  parent,
  childCols: [`${parent}_id`],
  parentCols: ['id'],
  nullable: false,
  onDelete: 'r',
  ...over,
});

const deletes = (steps: ReturnType<typeof planDeletes>) =>
  steps.flatMap((s) => (s.kind === 'delete' ? [s.table] : []));

describe('planDeletes', () => {
  it('deletes children before their parents', () => {
    const order = deletes(
      planDeletes(
        ['schools', 'branches', 'sections'],
        [fk('branches', 'schools'), fk('sections', 'branches')],
      ),
    );
    expect(order).toEqual(['sections', 'branches', 'schools']);
  });

  it('ignores keys to unmarked tables and non-blocking rules', () => {
    const order = deletes(
      planDeletes(
        ['a', 'b'],
        [
          fk('a', 'b', { onDelete: 'c' }),
          fk('a', 'other'),
          fk('b', 'a', { onDelete: 'n' }),
        ],
      ),
    );
    expect(order.sort()).toEqual(['a', 'b']);
  });

  it('cuts a cycle through a nullable key first', () => {
    const cut = fk('files', 'schools', { nullable: true });
    const steps = planDeletes(
      ['schools', 'files'],
      [cut, fk('schools', 'files', { childCols: ['logo_file_id'] })],
    );
    expect(steps[0]).toEqual({ kind: 'nullify', fk: cut });
    expect(deletes(steps)).toEqual(['schools', 'files']);
  });

  it('clears nullable self references, keeps NOT NULL ones for one statement', () => {
    const self = fk('sessions', 'sessions', { nullable: true });
    const steps = planDeletes(['sessions'], [self, fk('sessions', 'sessions')]);
    expect(steps).toEqual([
      { kind: 'nullify', fk: self },
      { kind: 'delete', table: 'sessions' },
    ]);
  });

  it('refuses a cycle of NOT NULL keys', () => {
    expect(() => planDeletes(['a', 'b'], [fk('a', 'b'), fk('b', 'a')])).toThrow(
      /NOT NULL key cycle in: a, b/,
    );
  });
});
