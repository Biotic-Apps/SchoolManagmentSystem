import type { ApprovalService } from '../../core/approvals/approval.service';
import type { AuditService } from '../../core/audit/audit.service';
import { parseDate } from '../../core/common/dates';
import { ErrorCode } from '../../core/common/errors/error-code.enum';
import { schoolDate } from '../../core/common/school-time';
import type { AuthUser } from '../../core/common/types/auth-user';
import type { NotificationService } from '../../core/notifications/notification.service';
import type { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type { SchoolPeopleService } from '../school-day/school-people.service';
import type { StudentPlacementService } from '../school-day/student-placement.service';
import { DeparturesService } from './departures/departures.service';
import { EarlyLeaveService } from './early-leave/early-leave.service';
import type { EarlyLeaveMapper } from './early-leave/early-leave.mapper';

const USER = { id: 'u1', activeRole: 'PRINCIPAL' } as AuthUser;
const SCOPE = {} as Scope;
const DAY_MS = 86_400_000;
const today = () => schoolDate();
const dayOffset = (days: number) =>
  schoolDate(new Date(Date.now() + days * DAY_MS));

describe('EarlyLeaveService.request date', () => {
  function setup() {
    const placements = { read: jest.fn().mockRejectedValue(new Error('next')) };
    const service = new EarlyLeaveService(
      {} as PrismaService,
      placements as unknown as StudentPlacementService,
      {} as SchoolPeopleService,
      {} as ApprovalService,
      {} as NotificationService,
      {} as AuditService,
      {} as EarlyLeaveMapper,
    );
    return { service, placements };
  }
  const dto = (date: string) => ({
    studentId: 's1',
    date,
    time: '11:30',
    reason: 'Dentist',
  });

  it('rejects a past date', async () => {
    const { service, placements } = setup();
    await expect(
      service.request(USER, SCOPE, dto(dayOffset(-7))),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
    expect(placements.read).not.toHaveBeenCalled();
  });

  it.each([0, 1])('accepts today + %i days', async (days) => {
    const { service, placements } = setup();
    await expect(
      service.request(USER, SCOPE, dto(days ? dayOffset(days) : today())),
    ).rejects.toThrow('next');
    expect(placements.read).toHaveBeenCalled();
  });
});

describe('DeparturesService.record early-leave day', () => {
  function setup(leaveDate: string) {
    const prisma = {
      pickupPerson: {
        findUnique: jest.fn().mockResolvedValue({
          studentId: 's1',
          status: 'VERIFIED',
          name: 'Uncle',
        }),
      },
      earlyLeave: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'l1',
          studentId: 's1',
          status: 'APPROVED',
          date: parseDate(leaveDate),
        }),
      },
      $transaction: jest.fn().mockRejectedValue(new Error('saved')),
    };
    const placements = {
      read: jest.fn().mockResolvedValue({
        studentId: 's1',
        schoolId: 'sc',
        branchId: 'b',
        name: 'Ali',
      }),
    };
    const service = new DeparturesService(
      prisma as unknown as PrismaService,
      placements as unknown as StudentPlacementService,
      {} as SchoolPeopleService,
      {} as NotificationService,
      {} as AuditService,
    );
    return { service, prisma };
  }
  const dto = (at?: string) => ({
    studentId: 's1',
    earlyLeaveId: 'l1',
    pickedUpBy: { pickupPersonId: 'p1' },
    at,
  });

  it('rejects an early leave for another day', async () => {
    const { service, prisma } = setup(dayOffset(1));
    await expect(service.record(USER, SCOPE, dto())).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      message: 'Early leave is for a different day',
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("accepts today's early leave", async () => {
    const { service } = setup(today());
    await expect(service.record(USER, SCOPE, dto())).rejects.toThrow('saved');
  });

  it('rejects a departure time in the future', async () => {
    const { service, prisma } = setup(today());
    const later = new Date(Date.now() + 3 * 60 * 60_000).toISOString();
    await expect(service.record(USER, SCOPE, dto(later))).rejects.toMatchObject(
      { code: ErrorCode.VALIDATION_FAILED },
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
