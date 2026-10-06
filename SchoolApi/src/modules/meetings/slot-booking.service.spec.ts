import type { AuditService } from '../../core/audit/audit.service';
import { AppError } from '../../core/common/errors/app-error';
import { ErrorCode } from '../../core/common/errors/error-code.enum';
import type { AuthUser } from '../../core/common/types/auth-user';
import { today } from '../../core/common/week';
import type { PrismaService } from '../../core/prisma/prisma.service';
import { Scope } from '../../core/rbac/scope/scope';
import type { SchoolPeopleService } from '../school-day/school-people.service';
import type { StudentPlacementService } from '../school-day/student-placement.service';
import type { MeetingNotifier } from './meeting-notifier';
import { SlotBookingService } from './slot-booking.service';

const slot = {
  id: 'slot-1',
  schoolId: 'school',
  branchId: 'branch',
  staffUserId: 'teacher',
  date: new Date(today().getTime() + 86_400_000),
  startTime: '10:00',
  endTime: '10:15',
  mode: 'IN_PERSON',
  location: null,
  status: 'OPEN',
};

function setup() {
  const claims = [{ count: 1 }, { count: 0 }];
  const tx = {
    meetingSlot: {
      updateMany: jest.fn(() => Promise.resolve(claims.shift())),
    },
    meeting: {
      create: jest.fn(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'meeting-1', ...data }),
      ),
    },
  };
  const prisma = {
    guardian: {
      findUnique: jest.fn().mockResolvedValue({ id: 'g-1', userId: 'parent' }),
    },
    meetingSlot: { findUnique: jest.fn().mockResolvedValue(slot) },
    $transaction: (fn: (t: typeof tx) => Promise<unknown>) => fn(tx),
  };
  const placements = {
    read: jest.fn().mockResolvedValue({
      studentId: 'student-1',
      name: 'Ali Khan',
      schoolId: 'school',
      branchId: 'branch',
      sessionId: 'session',
      sectionId: 'section',
    }),
  };
  const notifier = { others: jest.fn() };
  const service = new SlotBookingService(
    prisma as unknown as PrismaService,
    placements as unknown as StudentPlacementService,
    {} as SchoolPeopleService,
    notifier as unknown as MeetingNotifier,
    { stage: jest.fn() } as unknown as AuditService,
  );
  return { service, tx, notifier };
}

const parent = { id: 'parent', activeRole: 'PARENT' } as AuthUser;
const scope = Scope.createLimited({
  schoolIds: [],
  branchIds: [],
  sectionIds: [],
  memberSchoolIds: ['school'],
  memberBranchIds: [],
  studentIds: ['student-1'],
  guardian: true,
});
const dto = { slotId: 'slot-1', studentId: 'student-1', agenda: 'Progress' };

describe('SlotBookingService', () => {
  it('books an open slot atomically', async () => {
    const { service, tx, notifier } = setup();
    await expect(service.create(parent, scope, dto)).resolves.toBe('meeting-1');
    expect(tx.meetingSlot.updateMany).toHaveBeenCalledWith({
      where: { id: 'slot-1', status: 'OPEN' },
      data: { status: 'BOOKED' },
    });
    expect(notifier.others).toHaveBeenCalled();
  });

  it('rejects the second booking of the same slot with 409', async () => {
    const { service, tx } = setup();
    await service.create(parent, scope, dto);
    const second = service.create(parent, scope, dto);
    await expect(second).rejects.toBeInstanceOf(AppError);
    await expect(second).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
      status: 409,
      message: 'Slot already taken',
    });
    expect(tx.meeting.create).toHaveBeenCalledTimes(1);
  });

  it('maps the unique index violation to 409', async () => {
    const { service, tx } = setup();
    const unique = Object.assign(new Error('unique'), {
      name: 'PrismaClientKnownRequestError',
      code: 'P2002',
    });
    tx.meeting.create.mockRejectedValueOnce(unique);
    await expect(service.create(parent, scope, dto)).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
    });
  });
});
