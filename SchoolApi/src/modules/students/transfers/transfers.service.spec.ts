import type { AuditService } from '../../../core/audit/audit.service';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { NotificationService } from '../../../core/notifications/notification.service';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import { ScopeService } from '../../../core/rbac/scope/scope.service';
import type { EnrollmentWriter } from '../enrollment/enrollment-writer';
import type { StudentAccessService } from '../student-access.service';
import { TransfersService } from './transfers.service';
import type { TransfersRepository } from './transfers.repository';

const principalOf = (branchId: string) =>
  ScopeService.resolve([
    {
      id: 'a',
      roleId: 'r',
      roleKey: 'PRINCIPAL',
      roleName: 'Principal',
      scopeType: 'BRANCH',
      schoolId: 'school',
      schoolName: null,
      branchId,
      branchName: null,
      sectionId: null,
      subjectId: null,
      validFrom: new Date(0).toISOString(),
      validUntil: null,
    },
  ]);

const effectiveDate = new Date('2026-11-01');
const transfer = (status = 'REQUESTED') => ({
  id: 't1',
  schoolId: 'school',
  studentId: 'student',
  fromBranchId: 'north',
  toBranchId: 'south',
  fromEnrollmentId: 'enr-old',
  toEnrollmentId: null,
  effectiveDate,
  reason: 'Moved house',
  status,
  decisionReason: null,
  createdAt: new Date(),
  student: {
    id: 'student',
    firstName: 'Ali',
    lastName: 'Khan',
    admissionNo: 'B-1',
  },
  fromBranch: {
    id: 'north',
    name: 'North',
    schoolId: 'school',
    principalUserId: 'p-north',
  },
  toBranch: {
    id: 'south',
    name: 'South',
    schoolId: 'school',
    principalUserId: 'p-south',
  },
});

function setup(sectionBranch = 'south', ended = 1) {
  const tx = {
    transfer: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn(),
    },
    enrollment: { updateMany: jest.fn().mockResolvedValue({ count: ended }) },
  };
  const prisma = {
    section: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'sec', branchId: sectionBranch }),
    },
    $transaction: (fn: (t: typeof tx) => Promise<unknown>) => fn(tx),
  };
  const repository = { findById: jest.fn().mockResolvedValue(transfer()) };
  const writer = { enroll: jest.fn().mockResolvedValue({ id: 'enr-new' }) };
  const notify = jest.fn();
  const service = new TransfersService(
    prisma as unknown as PrismaService,
    repository as unknown as TransfersRepository,
    {} as StudentAccessService,
    writer as unknown as EnrollmentWriter,
    { notify } as unknown as NotificationService,
    { stage: jest.fn() } as unknown as AuditService,
  );
  return { service, tx, writer, notify, repository };
}

const user = { id: 'p-south' } as AuthUser;
const codeOf = (promise: Promise<unknown>) =>
  promise.then(
    () => 'ok',
    (error: { code?: string }) => error.code,
  );

describe('TransfersService.accept', () => {
  it('ends the source enrollment and starts the destination one on the effective date', async () => {
    const { service, tx, writer, notify } = setup();
    await service.accept(user, principalOf('south'), 't1', 'sec');

    expect(tx.transfer.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 't1', status: 'REQUESTED' } }),
    );
    expect(tx.enrollment.updateMany).toHaveBeenCalledWith({
      where: { id: 'enr-old', status: 'ACTIVE' },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        status: 'TRANSFERRED_OUT',
        endDate: effectiveDate,
      }),
    });
    expect(writer.enroll).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        studentId: 'student',
        sectionId: 'sec',
        startDate: effectiveDate,
      }),
    );
    expect(tx.transfer.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { toEnrollmentId: 'enr-new' },
    });
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ userIds: ['p-north'] }),
    );
  });

  it('only the destination branch can accept', async () => {
    const { service, writer } = setup();
    expect(
      await codeOf(service.accept(user, principalOf('north'), 't1', 'sec')),
    ).toBe('FORBIDDEN_SCOPE');
    expect(writer.enroll).not.toHaveBeenCalled();
  });

  it('requires a section of the destination branch', async () => {
    const { service } = setup('north');
    expect(
      await codeOf(service.accept(user, principalOf('south'), 't1', 'sec')),
    ).toBe('VALIDATION_FAILED');
  });

  it('fails when the source enrollment is no longer active', async () => {
    const { service, writer } = setup('south', 0);
    expect(
      await codeOf(service.accept(user, principalOf('south'), 't1', 'sec')),
    ).toBe('CONFLICT');
    expect(writer.enroll).not.toHaveBeenCalled();
  });
});
