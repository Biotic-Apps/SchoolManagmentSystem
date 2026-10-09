import { bandProblems } from '../../results/grading/grade-bands';
import {
  createDefaultGradingScheme,
  DEFAULT_BANDS,
} from './default-grading-scheme';
import type { SetupContext } from './setup-context';

interface CreateArgs {
  data: {
    name: string;
    status: string;
    passPercent: number;
    approvedById: string;
    createdById: string;
    bands: { create: { grade: string; minPercent: number }[] };
  };
}

describe('createDefaultGradingScheme', () => {
  const run = async () => {
    const create = jest.fn((args: CreateArgs) =>
      Promise.resolve({ id: 'scheme-1', ...args.data }),
    );
    const ctx = {
      tx: { gradingScheme: { create } },
      actorId: 'admin',
      audit: [],
    } as unknown as SetupContext;
    await createDefaultGradingScheme(
      ctx,
      { id: 'branch-1', schoolId: 'school-1' },
      { id: 'session-1', name: '2026-27' },
    );
    return { data: create.mock.calls[0][0].data, ctx };
  };

  it('creates an approved "Standard <session>" scheme with a 40% pass mark', async () => {
    const { data, ctx } = await run();
    expect(data).toMatchObject({
      name: 'Standard 2026-27',
      status: 'APPROVED',
      passPercent: 40,
      approvedById: 'admin',
      createdById: 'admin',
    });
    expect(data.bands.create.map((b) => b.grade)).toEqual([
      'A+',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
    ]);
    expect(ctx.audit).toEqual([
      expect.objectContaining({
        action: 'grading.create',
        entityId: 'scheme-1',
        schoolId: 'school-1',
        branchId: 'branch-1',
      }),
    ]);
  });

  it('uses bands that pass the grading validation (contiguous 0–100)', () => {
    const bands = DEFAULT_BANDS.map(([grade, minPercent, maxPercent]) => ({
      grade,
      minPercent,
      maxPercent,
    }));
    expect(bandProblems(bands)).toEqual([]);
  });
});
