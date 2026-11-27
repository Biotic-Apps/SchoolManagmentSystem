import type { ApprovalService } from '../../../core/approvals/approval.service';
import type { AuditService } from '../../../core/audit/audit.service';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { RegisterAccessService } from '../register-access.service';
import { CorrectionService } from './correction.service';

describe('CorrectionService approval payload', () => {
  it('carries the student, day, old and new status and the reason for the approver', async () => {
    const entry = {
      id: 'entry-1',
      status: 'PRESENT',
      register: {
        sectionId: 'sec',
        status: 'LOCKED',
        date: new Date('2026-11-27T00:00:00Z'),
      },
      student: { firstName: 'Ali', lastName: 'Hassan' },
    };
    const tx = {
      attendanceCorrection: {
        create: jest.fn().mockResolvedValue({ id: 'corr-1' }),
        update: jest.fn().mockResolvedValue({
          id: 'corr-1',
          entryId: 'entry-1',
          oldStatus: 'PRESENT',
          newStatus: 'LATE',
          reason: 'Arrived 8:20',
          status: 'PENDING',
          approvalId: 'appr-1',
          createdAt: new Date(),
        }),
      },
    };
    const prisma = {
      attendanceEntry: { findUnique: jest.fn().mockResolvedValue(entry) },
      $transaction: jest.fn((fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
    };
    const approvals = { create: jest.fn().mockResolvedValue({ id: 'appr-1' }) };
    const service = new CorrectionService(
      prisma as unknown as PrismaService,
      {
        writer: jest.fn().mockResolvedValue({
          section: { schoolId: 's', branchId: 'b' },
        }),
      } as unknown as RegisterAccessService,
      approvals as unknown as ApprovalService,
      { stage: jest.fn() } as unknown as AuditService,
    );
    await service.request({ id: 'teacher' } as AuthUser, {} as Scope, {
      entryId: 'entry-1',
      newStatus: 'LATE',
      reason: 'Arrived 8:20',
    });
    expect(approvals.create).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          studentName: 'Ali Hassan',
          date: '2026-11-27',
          oldStatus: 'PRESENT',
          newStatus: 'LATE',
          reason: 'Arrived 8:20',
        }) as unknown,
      }),
      tx,
    );
  });
});
