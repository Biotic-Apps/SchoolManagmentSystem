import type { AuditService } from '../../core/audit/audit.service';
import type { AuthUser } from '../../core/common/types/auth-user';
import type { OutboxService } from '../../core/outbox/outbox.service';
import type { PrismaService } from '../../core/prisma/prisma.service';
import type { AccessCache } from '../../core/rbac/access/access-cache';
import { Scope } from '../../core/rbac/scope/scope';
import type { StudentRegistrationService } from '../students/registration/student-registration.service';
import { AdmissionConfirmService } from './admission-confirm.service';
import type { ApplicationAccessService } from './application-access.service';

const user = { id: 'principal' } as AuthUser;
const scope = Scope.createGlobal();
const application = {
  id: 'app-1',
  status: 'OFFERED',
  schoolId: 'school',
  branchId: 'branch',
  sessionId: 'session',
  classId: 'class-1',
  child: {
    firstName: 'Ali',
    lastName: 'Khan',
    dob: '2020-01-01',
    gender: 'MALE',
  },
  guardians: [
    {
      name: 'Mr Khan',
      relation: 'FATHER',
      phone: '+923001234567',
      isPrimary: true,
    },
  ],
  medical: null,
};
const dto = {
  admissionFee: { status: 'PAID' as const, amountMinor: 500000 },
  sectionId: 'section-1',
  admissionDate: '2026-10-06',
};

function setup(section: object | null, claimed = 1) {
  const tx = {
    admissionApplication: {
      updateMany: jest.fn().mockResolvedValue({ count: claimed }),
      update: jest
        .fn()
        .mockResolvedValue({ ...application, status: 'ENROLLED' }),
    },
  };
  const prisma = {
    section: { findUnique: jest.fn().mockResolvedValue(section) },
    $transaction: (fn: (t: typeof tx) => Promise<unknown>) => fn(tx),
  };
  const registration = {
    register: jest.fn().mockResolvedValue({
      studentId: 'student-1',
      admissionNo: 'BRIGHT-2026-0041',
      enrollmentId: 'enr-1',
      outboxIds: ['evt-1'],
      guardianUserIds: ['parent-user'],
      parentLogins: [],
    }),
  };
  const outbox = { publish: jest.fn() };
  const cache = { invalidateUser: jest.fn() };
  const access = {
    loadIn: jest.fn().mockResolvedValue(application),
    toDto: jest.fn().mockResolvedValue({ id: 'app-1', status: 'ENROLLED' }),
  };
  const service = new AdmissionConfirmService(
    prisma as unknown as PrismaService,
    access as unknown as ApplicationAccessService,
    registration as unknown as StudentRegistrationService,
    outbox as unknown as OutboxService,
    cache as unknown as AccessCache,
    { stage: jest.fn() } as unknown as AuditService,
  );
  return { service, tx, registration, outbox, cache };
}

const matchingSection = {
  id: 'section-1',
  branchId: 'branch',
  sessionId: 'session',
  classId: 'class-1',
  school: { code: 'BRIGHT' },
};

const codeOf = (promise: Promise<unknown>) =>
  promise.then(
    () => 'ok',
    (error: { code?: string }) => error.code,
  );

describe('AdmissionConfirmService', () => {
  it('registers the student in one transaction and publishes the ID card job after commit', async () => {
    const { service, tx, registration, outbox, cache } = setup(matchingSection);
    const result = await service.confirm(user, scope, 'app-1', dto);

    expect(result.studentId).toBe('student-1');
    expect(registration.register).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        schoolCode: 'BRIGHT',
        sectionId: 'section-1',
        admissionDate: '2026-10-06',
      }),
    );
    expect(tx.admissionApplication.update).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          status: 'ENROLLED',
          studentId: 'student-1',
        }),
      }),
    );
    expect(outbox.publish).toHaveBeenCalledWith(['evt-1']);
    expect(cache.invalidateUser).toHaveBeenCalledWith('parent-user');
  });

  it('rejects a section of another class', async () => {
    const { service, registration } = setup({
      ...matchingSection,
      classId: 'class-2',
    });
    expect(await codeOf(service.confirm(user, scope, 'app-1', dto))).toBe(
      'VALIDATION_FAILED',
    );
    expect(registration.register).not.toHaveBeenCalled();
  });

  it('refuses when another request already confirmed the application', async () => {
    const { service, registration, outbox } = setup(matchingSection, 0);
    expect(await codeOf(service.confirm(user, scope, 'app-1', dto))).toBe(
      'CONFLICT',
    );
    expect(registration.register).not.toHaveBeenCalled();
    expect(outbox.publish).not.toHaveBeenCalled();
  });
});
