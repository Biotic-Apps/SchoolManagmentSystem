import type { AuditService } from '../../core/audit/audit.service';
import type { AuthUser } from '../../core/common/types/auth-user';
import { ClientRequestService } from '../../core/idempotency/client-request.service';
import type { PrismaService } from '../../core/prisma/prisma.service';
import type { ProbationGate } from '../../core/probation/probation-gate';
import type { Scope } from '../../core/rbac/scope/scope';
import type { WorkingDayService } from '../school-day/working-day.service';
import type { AbsenceNotifier } from './absence-notifier';
import type { RegisterAccessService } from './register-access.service';
import type { RegisterLockPolicy } from './register-lock';
import type { RegisterSubmitAction } from './register-submit.action';
import type { RegisterViewService } from './register-view.service';
import type { RegisterWriter } from './register-writer';
import { RegistersService } from './registers.service';

function setup() {
  const stored = new Map<string, string>();
  const prisma = {
    academicSession: {
      findUnique: jest.fn().mockResolvedValue({
        startDate: new Date('2026-04-01T00:00:00Z'),
        endDate: new Date('2027-03-31T00:00:00Z'),
      }),
    },
    clientRequest: {
      findUnique: jest.fn(
        ({
          where,
        }: {
          where: { userId_clientRequestId: { clientRequestId: string } };
        }) => {
          const id = stored.get(where.userId_clientRequestId.clientRequestId);
          return Promise.resolve(id ? { entityId: id } : null);
        },
      ),
    },
    $transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        clientRequest: {
          create: jest.fn(
            ({
              data,
            }: {
              data: { clientRequestId: string; entityId: string };
            }) => {
              stored.set(data.clientRequestId, data.entityId);
              return Promise.resolve(data);
            },
          ),
        },
      }),
    ),
  };
  const writer = {
    save: jest.fn().mockResolvedValue({
      registerId: 'reg-1',
      roster: [],
      filledStudentIds: null,
    }),
  };
  const absences = { notify: jest.fn() };
  const section = { id: 'sec', schoolId: 's', branchId: 'b', sessionId: 'ses' };
  const service = new RegistersService(
    prisma as unknown as PrismaService,
    {
      writer: jest
        .fn()
        .mockResolvedValue({ section, onBehalfOfStaffId: null, helper: false }),
    } as unknown as RegisterAccessService,
    {
      build: jest.fn().mockResolvedValue({ id: 'reg-1' }),
    } as unknown as RegisterViewService,
    writer as unknown as RegisterWriter,
    {} as RegisterSubmitAction,
    {} as ProbationGate,
    new ClientRequestService(prisma as unknown as PrismaService),
    { assertWorkingDay: jest.fn() } as unknown as WorkingDayService,
    { stage: jest.fn() } as unknown as AuditService,
    {
      isPastLock: jest.fn().mockResolvedValue(false),
    } as unknown as RegisterLockPolicy,
    absences as unknown as AbsenceNotifier,
  );
  return { service, writer, absences };
}

describe('RegistersService idempotency', () => {
  const user = { id: 'teacher' } as AuthUser;
  const scope = {} as Scope;
  const dto = {
    sectionId: 'sec',
    date: '2026-11-23',
    entries: [{ studentId: 'st', status: 'PRESENT' as const }],
    clientRequestId: 'offline-0001',
  };

  it('applies the same clientRequestId only once', async () => {
    const { service, writer } = setup();
    await service.save(user, scope, dto);
    await service.save(user, scope, dto);
    await service.save(user, scope, dto);
    expect(writer.save).toHaveBeenCalledTimes(1);
  });

  it('applies every call without a clientRequestId', async () => {
    const { service, writer } = setup();
    const plain = { ...dto, clientRequestId: undefined };
    await service.save(user, scope, plain);
    await service.save(user, scope, plain);
    expect(writer.save).toHaveBeenCalledTimes(2);
  });
});

describe('RegistersService dates and late marks', () => {
  const user = { id: 'teacher' } as AuthUser;
  const scope = {} as Scope;

  it('refuses a date before the section session starts', async () => {
    const { service, writer } = setup();
    await expect(
      service.save(user, scope, {
        sectionId: 'sec',
        date: '2026-03-02',
        entries: [{ studentId: 'st', status: 'PRESENT' }],
      }),
    ).rejects.toThrow('outside the academic session');
    expect(writer.save).not.toHaveBeenCalled();
  });

  it('notifies guardians and skips the submit step when only new students were filled in', async () => {
    const { service, writer, absences } = setup();
    writer.save.mockResolvedValueOnce({
      registerId: 'reg-1',
      roster: [],
      filledStudentIds: ['new'],
    });
    await service.submit(user, scope, {
      sectionId: 'sec',
      date: '2026-11-23',
      entries: [{ studentId: 'new', status: 'ABSENT' }],
    });
    expect(absences.notify).toHaveBeenCalledWith('reg-1');
  });
});
