import type { AuditService } from '../../core/audit/audit.service';
import { formatDate } from '../../core/common/dates';
import { ErrorCode } from '../../core/common/errors/error-code.enum';
import type { AuthUser } from '../../core/common/types/auth-user';
import { today } from '../../core/common/week';
import type { PrismaService } from '../../core/prisma/prisma.service';
import { Scope } from '../../core/rbac/scope/scope';
import type { StudentPlacementService } from '../school-day/student-placement.service';
import { MeetingRequestsService } from './meeting-requests.service';
import type { MeetingNotifier } from './meeting-notifier';
import type { MeetingTeachersService } from './meeting-teachers.service';
import { addMinutes } from './meeting-times';
import type { MeetingsService } from './meetings.service';

const tomorrow = formatDate(new Date(today().getTime() + 86_400_000));

const requested = {
  id: 'meeting-1',
  schoolId: 'school',
  branchId: 'branch',
  staffUserId: 'teacher',
  guardian: { id: 'g-1', name: 'Parent', userId: 'parent' },
  date: new Date(today().getTime() + 86_400_000),
  startTime: '10:00',
  endTime: '10:30',
  mode: 'IN_PERSON',
  location: null,
  status: 'REQUESTED',
  student: { id: 'student-1', firstName: 'Ali', lastName: 'Khan' },
  staffUser: { id: 'teacher', name: 'Teacher' },
  followUps: [],
};

function setup() {
  const prisma = {
    guardian: {
      findUnique: jest.fn().mockResolvedValue({ id: 'g-1', userId: 'parent' }),
    },
    meeting: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'meeting-1', ...data }),
      ),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findUniqueOrThrow: jest.fn().mockResolvedValue(requested),
    },
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
  const teachers = {
    forPlacement: jest
      .fn()
      .mockResolvedValue([
        { userId: 'teacher', name: 'T', roles: [], openSlots: 0 },
      ]),
  };
  const meetings = { load: jest.fn().mockResolvedValue(requested) };
  const notifier = { send: jest.fn(), others: jest.fn() };
  const audit = { stage: jest.fn() };
  const service = new MeetingRequestsService(
    prisma as unknown as PrismaService,
    placements as unknown as StudentPlacementService,
    teachers as unknown as MeetingTeachersService,
    meetings as unknown as MeetingsService,
    notifier as unknown as MeetingNotifier,
    audit as unknown as AuditService,
  );
  return { service, prisma, notifier, audit };
}

const parent = { id: 'parent', activeRole: 'PARENT' } as AuthUser;
const teacher = {
  id: 'teacher',
  activeRole: 'TEACHER',
  assignments: [],
} as unknown as AuthUser;
const other = {
  id: 'other-teacher',
  activeRole: 'TEACHER',
  assignments: [],
} as unknown as AuthUser;
const guardianScope = Scope.createLimited({
  schoolIds: [],
  branchIds: [],
  sectionIds: [],
  memberSchoolIds: ['school'],
  memberBranchIds: [],
  studentIds: ['student-1'],
  guardian: true,
});
const staffScope = Scope.createLimited({
  schoolIds: [],
  branchIds: [],
  sectionIds: ['section'],
  memberSchoolIds: ['school'],
  memberBranchIds: ['branch'],
});
const dto = {
  studentId: 'student-1',
  staffUserId: 'teacher',
  date: tomorrow,
  startTime: '10:00',
  mode: 'IN_PERSON' as const,
  agenda: ' Progress ',
};

describe('MeetingRequestsService', () => {
  it('creates a REQUESTED meeting with a 30 minute default and notifies the teacher', async () => {
    const { service, prisma, notifier, audit } = setup();
    await expect(service.request(parent, guardianScope, dto)).resolves.toBe(
      'meeting-1',
    );
    expect(prisma.meeting.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'REQUESTED',
        staffUserId: 'teacher',
        guardianId: 'g-1',
        endTime: '10:30',
        agenda: 'Progress',
        requestedById: 'parent',
      }) as unknown,
    });
    expect(notifier.send).toHaveBeenCalledWith(
      ['teacher'],
      expect.anything(),
      "Meeting request from Ali Khan's parent",
      expect.stringContaining('Progress'),
    );
    expect(audit.stage).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'meetings.parentRequest' }),
    );
  });

  it('only lets parents ask', async () => {
    const { service } = setup();
    await expect(
      service.request(teacher, staffScope, dto),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });
  });

  it("rejects a teacher who doesn't teach the child", async () => {
    const { service, prisma } = setup();
    await expect(
      service.request(parent, guardianScope, { ...dto, staffUserId: 'x' }),
    ).rejects.toMatchObject({ status: 404 });
    expect(prisma.meeting.create).not.toHaveBeenCalled();
  });

  it('allows one open request per teacher and child', async () => {
    const { service, prisma } = setup();
    prisma.meeting.findFirst.mockResolvedValueOnce({ id: 'old' });
    await expect(
      service.request(parent, guardianScope, dto),
    ).rejects.toMatchObject({ code: ErrorCode.CONFLICT });
  });

  it('rejects a past date', async () => {
    const { service } = setup();
    await expect(
      service.request(parent, guardianScope, { ...dto, date: '2020-01-01' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('teacher accepts: REQUESTED → SCHEDULED at the final time, parent notified', async () => {
    const { service, prisma, notifier } = setup();
    await service.accept(teacher, staffScope, 'meeting-1', {
      startTime: '11:00',
      endTime: '11:20',
    });
    expect(prisma.meeting.updateMany).toHaveBeenCalledWith({
      where: { id: 'meeting-1', status: 'REQUESTED' },
      data: expect.objectContaining({
        status: 'SCHEDULED',
        startTime: '11:00',
        endTime: '11:20',
      }) as unknown,
    });
    expect(notifier.others).toHaveBeenCalledWith(
      requested,
      'teacher',
      'Meeting confirmed',
    );
  });

  it('teacher declines: REQUESTED → CANCELLED with the reason', async () => {
    const { service, prisma } = setup();
    await service.decline(teacher, staffScope, 'meeting-1', {
      reason: ' Away ',
    });
    expect(prisma.meeting.updateMany).toHaveBeenCalledWith({
      where: { id: 'meeting-1', status: 'REQUESTED' },
      data: { status: 'CANCELLED', reason: 'Away' },
    });
  });

  it('409 when the request was already answered', async () => {
    const { service, prisma } = setup();
    prisma.meeting.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(
      service.decline(teacher, staffScope, 'meeting-1', {}),
    ).rejects.toMatchObject({ code: ErrorCode.CONFLICT });
  });

  it('only the asked teacher (or a principal) answers; never the parent', async () => {
    const { service } = setup();
    await expect(
      service.accept(other, staffScope, 'meeting-1', {}),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });
    await expect(
      service.accept(parent, guardianScope, 'meeting-1', {}),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });
  });
});

describe('addMinutes', () => {
  it('adds and caps at the end of the day', () => {
    expect(addMinutes('09:45', 30)).toBe('10:15');
    expect(addMinutes('23:50', 30)).toBe('23:59');
  });
});
