import type { Scope } from '../../../core/rbac/scope/scope';
import { ExamsService } from './exams.service';

const scope = {} as Scope;

function setup(
  status: string,
  opts: { approvalPending?: boolean; raced?: boolean } = {},
) {
  const exam = {
    id: 'e1',
    name: 'QA Mid-Term 2026',
    schoolId: 'sch',
    branchId: 'br',
    status,
    version: 4,
    approvalId: opts.approvalPending === undefined ? null : 'ap1',
  };
  const prisma = {
    approvalRequest: {
      count: jest.fn().mockResolvedValue(opts.approvalPending ? 1 : 0),
    },
    exam: {
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: opts.raced ? 0 : 1 }),
    },
    markSheet: { findMany: jest.fn().mockResolvedValue([]) },
    staff: { findMany: jest.fn().mockResolvedValue([]) },
  };
  const access = { manage: jest.fn().mockResolvedValue(exam) };
  const mapper = { withPapers: jest.fn().mockResolvedValue({ id: 'e1' }) };
  const notifications = { notify: jest.fn() };
  const audit = { stage: jest.fn() };
  const readiness = { assertReady: jest.fn() };
  const service = new ExamsService(
    prisma as never,
    access as never,
    mapper as never,
    {} as never,
    notifications as never,
    audit as never,
    readiness as never,
  );
  return { service, prisma, audit, readiness };
}

describe('ExamsService.reopenMarks', () => {
  it('reopens a closed exam, clears the approval and audits the reason', async () => {
    const { service, prisma, audit } = setup('MARKS_CLOSED', {
      approvalPending: false,
    });
    await service.reopenMarks(scope, 'e1', { reason: 'Bilal enrolled late' });
    expect(prisma.exam.updateMany).toHaveBeenCalledWith({
      where: { id: 'e1', version: 4 },
      data: {
        status: 'MARKS_OPEN',
        approvalId: null,
        version: { increment: 1 },
      },
    });
    expect(audit.stage).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'exam.reopen_marks',
        before: { status: 'MARKS_CLOSED', approvalId: 'ap1' },
        after: { status: 'MARKS_OPEN', reason: 'Bilal enrolled late' },
      }),
    );
  });

  it('refuses while a results approval is pending', async () => {
    const { service, prisma } = setup('MARKS_CLOSED', {
      approvalPending: true,
    });
    await expect(
      service.reopenMarks(scope, 'e1', { reason: 'fix' }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('awaiting approval') as string,
    });
    expect(prisma.exam.updateMany).not.toHaveBeenCalled();
  });

  it('refuses published exams', async () => {
    const { service } = setup('PUBLISHED');
    await expect(
      service.reopenMarks(scope, 'e1', { reason: 'fix' }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('published') as string,
    });
  });

  it('reports a concurrent change', async () => {
    const { service } = setup('MARKS_CLOSED', { raced: true });
    await expect(
      service.reopenMarks(scope, 'e1', { reason: 'fix' }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('changed meanwhile') as string,
    });
  });
});

describe('ExamsService.setStatus MARKS_CLOSED', () => {
  it('checks every sheet is accepted and complete before closing', async () => {
    const { service, readiness, prisma } = setup('MARKS_OPEN');
    readiness.assertReady.mockRejectedValue(new Error('Marks are missing'));
    await expect(
      service.setStatus(scope, 'e1', { status: 'MARKS_CLOSED' }),
    ).rejects.toThrow('Marks are missing');
    expect(prisma.exam.update).not.toHaveBeenCalled();
  });

  it('closes when ready', async () => {
    const { service, prisma } = setup('MARKS_OPEN');
    await service.setStatus(scope, 'e1', { status: 'MARKS_CLOSED' });
    expect(prisma.exam.update).toHaveBeenCalled();
  });
});
