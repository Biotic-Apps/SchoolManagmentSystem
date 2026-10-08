import { expandClosure } from './expand-closure';
import type { RowMarks } from './row-marks';
import type { ForeignKey } from './schema-graph';

const fk = (child: string, parent: string) =>
  ({ child, parent, childCols: ['x'], parentCols: ['id'] }) as ForeignKey;

describe('expandClosure', () => {
  it('repeats passes until nothing new is marked', async () => {
    const marked = new Set(['schools']);
    // Each table gets rows the first time it is reached only.
    const pending = new Map([
      ['branches', 3],
      ['sections', 5],
    ]);
    const markChildren = jest.fn((key: ForeignKey) => {
      const n = pending.get(key.child) ?? 0;
      pending.delete(key.child);
      if (n > 0) marked.add(key.child);
      return Promise.resolve(n);
    });
    const marks = {
      // Child-first order: sections are only reached in the second pass.
      graph: {
        foreignKeys: [fk('sections', 'branches'), fk('branches', 'schools')],
      },
      has: (table: string) => marked.has(table),
      markChildren,
    } as unknown as RowMarks;

    const passes = await expandClosure(marks);

    expect(passes).toBe(3);
    expect([...marked]).toEqual(['schools', 'branches', 'sections']);
  });

  it('skips keys whose parent has nothing marked', async () => {
    const markChildren = jest.fn();
    const marks = {
      graph: { foreignKeys: [fk('a', 'b')] },
      has: () => false,
      markChildren,
    } as unknown as RowMarks;
    await expect(expandClosure(marks)).resolves.toBe(1);
    expect(markChildren).not.toHaveBeenCalled();
  });
});
