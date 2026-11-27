import type { AuthUser } from '../../../core/common/types/auth-user';
import type { Scope } from '../../../core/rbac/scope/scope';
import { MarkReviewService } from './mark-review.service';

const user = { id: 'principal' } as AuthUser;
const scope = {} as Scope;

function setup(
  sheetStatus: string,
  marks: unknown[],
  examStatus = 'MARKS_OPEN',
) {
  const sheet = {
    id: 's1',
    sectionId: 'sec',
    schoolId: 'sch',
    branchId: 'br',
    status: sheetStatus,
    marks,
  };
  const prisma = {
    markSheet: {
      update: jest.fn().mockResolvedValue({ ...sheet, comment: null }),
    },
  };
  const access = {
    manage: jest
      .fn()
      .mockResolvedValue({ sheet, exam: { status: examStatus } }),
  };
  const roster = {
    of: jest.fn().mockResolvedValue([
      { studentId: 'ali', name: 'Ali Hassan' },
      { studentId: 'bilal', name: 'Bilal Yousaf' },
    ]),
  };
  const sheets = { detail: jest.fn().mockResolvedValue({ id: 's1' }) };
  const notifier = { returned: jest.fn() };
  const audit = { stage: jest.fn() };
  const service = new MarkReviewService(
    prisma as never,
    access as never,
    roster as never,
    sheets as never,
    {} as never,
    {} as never,
    notifier as never,
    audit as never,
  );
  return { service, prisma, audit };
}

const aliOnly = [{ studentId: 'ali', absent: false, marks: 70 }];
const both = [...aliOnly, { studentId: 'bilal', absent: true, marks: null }];

describe('MarkReviewService.decide', () => {
  it('refuses to accept while a roster student is pending, naming them', async () => {
    const { service, prisma } = setup('SUBMITTED', aliOnly);
    await expect(
      service.decide(user, scope, 's1', 'ACCEPTED'),
    ).rejects.toMatchObject({
      message: expect.stringContaining('Bilal Yousaf') as string,
    });
    expect(prisma.markSheet.update).not.toHaveBeenCalled();
  });

  it('accepts when every student has marks or Absent', async () => {
    const { service, prisma, audit } = setup('SUBMITTED', both);
    await service.decide(user, scope, 's1', 'ACCEPTED');
    expect(prisma.markSheet.update).toHaveBeenCalled();
    expect(audit.stage).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'marks.accept' }),
    );
  });

  it('returns an accepted sheet with a reason while marks are open (audited)', async () => {
    const { service, prisma, audit } = setup('ACCEPTED', aliOnly);
    await service.decide(user, scope, 's1', 'RETURNED', 'Bilal joined late');
    expect(prisma.markSheet.update).toHaveBeenCalled();
    expect(audit.stage).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'marks.return',
        before: { status: 'ACCEPTED' },
      }),
    );
  });

  it('refuses to return an accepted sheet while marks entry is closed', async () => {
    const { service } = setup('ACCEPTED', aliOnly, 'MARKS_CLOSED');
    await expect(
      service.decide(user, scope, 's1', 'RETURNED', 'x'),
    ).rejects.toMatchObject({
      message: expect.stringContaining('Reopen marks entry') as string,
    });
  });
});
