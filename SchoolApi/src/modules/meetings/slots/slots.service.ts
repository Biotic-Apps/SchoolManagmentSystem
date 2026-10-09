import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { formatDate, parseDate } from '../../../core/common/dates';
import {
  conflict,
  forbidden,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { today } from '../../../core/common/week';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type {
  CreateSlotsDto,
  MeetingSlotDto,
  SlotInputDto,
  SlotQueryDto,
} from '../dto/slot.dto';
import { SLOT_INCLUDE, toSlotDto } from '../meeting.mapper';
import { assertMeetingTimes, overlaps } from '../meeting-times';

/** Staff publish bookable slots; parents browse open slots of their children's branches. */
@Injectable()
export class SlotsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly people: SchoolPeopleService,
    private readonly audit: AuditService,
  ) {}

  async list(scope: Scope, query: SlotQueryDto): Promise<MeetingSlotDto[]> {
    const dates: Prisma.DateTimeFilter = {
      gte: query.from ? parseDate(query.from) : today(),
      lte: query.to ? parseDate(query.to) : undefined,
    };
    const visibility: Prisma.MeetingSlotWhereInput = scope.guardian
      ? { branchId: { in: await this.childBranchIds(scope) }, status: 'OPEN' }
      : scope.branchFilter();
    const rows = await this.prisma.meetingSlot.findMany({
      where: {
        AND: [
          visibility,
          { staffUserId: query.staffUserId, date: dates },
          scope.guardian ? {} : { status: { not: 'CANCELLED' } },
        ],
      },
      include: SLOT_INCLUDE,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 500,
    });
    return rows.map(toSlotDto);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateSlotsDto,
  ): Promise<MeetingSlotDto[]> {
    if (scope.guardian) throw forbidden('Only staff can publish slots');
    const staff = await this.people.workplaceOf(user);
    if (!staff) throw forbidden('Only staff can publish slots');
    const inputs = this.inputs(dto);
    const days = inputs.map((s) =>
      assertMeetingTimes(s.date, s.startTime, s.endTime),
    );
    inputs.forEach((a, i) => {
      const clash = inputs.findIndex(
        (b, j) => j < i && a.date === b.date && overlaps(a, b),
      );
      if (clash >= 0) throw conflict('Slots overlap each other', a);
    });
    const existing = await this.prisma.meetingSlot.findMany({
      where: {
        staffUserId: user.id,
        date: { in: days },
        status: { not: 'CANCELLED' },
      },
    });
    for (const slot of inputs) {
      const clash = existing.find(
        (e) => formatDate(e.date) === slot.date && overlaps(e, slot),
      );
      if (clash) throw conflict('Slot overlaps an existing slot', slot);
    }
    const rows = await this.prisma.$transaction((tx) =>
      Promise.all(
        inputs.map((slot, i) => {
          const values = {
            endTime: slot.endTime,
            mode: slot.mode,
            location: slot.location?.trim() || null,
            status: 'OPEN' as const,
          };
          return tx.meetingSlot.upsert({
            where: {
              staffUserId_date_startTime: {
                staffUserId: user.id,
                date: days[i],
                startTime: slot.startTime,
              },
            },
            create: {
              ...values,
              schoolId: staff.schoolId,
              branchId: staff.branchId,
              staffUserId: user.id,
              date: days[i],
              startTime: slot.startTime,
            },
            update: values,
            include: SLOT_INCLUDE,
          });
        }),
      ),
    );
    for (const row of rows) {
      this.audit.stage({
        action: 'meetings.slot.create',
        entityType: 'MeetingSlot',
        entityId: row.id,
        schoolId: row.schoolId,
        branchId: row.branchId,
        after: toSlotDto(row),
      });
    }
    return rows.map(toSlotDto);
  }

  async remove(user: AuthUser, id: string): Promise<MeetingSlotDto> {
    const slot = await this.prisma.meetingSlot.findUnique({ where: { id } });
    if (!slot || slot.staffUserId !== user.id) throw notFound('Meeting slot');
    const claimed = await this.prisma.meetingSlot.updateMany({
      where: { id, status: 'OPEN' },
      data: { status: 'CANCELLED' },
    });
    if (claimed.count === 0) throw conflict('Only open slots can be removed');
    this.audit.stage({
      action: 'meetings.slot.delete',
      entityType: 'MeetingSlot',
      entityId: id,
      schoolId: slot.schoolId,
      branchId: slot.branchId,
      before: { status: slot.status },
      after: { status: 'CANCELLED' },
    });
    const row = await this.prisma.meetingSlot.findUniqueOrThrow({
      where: { id },
      include: SLOT_INCLUDE,
    });
    return toSlotDto(row);
  }

  private inputs(dto: CreateSlotsDto): SlotInputDto[] {
    if (dto.slots) return dto.slots;
    return [
      {
        date: dto.date!,
        startTime: dto.startTime!,
        endTime: dto.endTime!,
        mode: dto.mode!,
        location: dto.location,
      },
    ];
  }

  private async childBranchIds(scope: Scope): Promise<string[]> {
    const rows = await this.prisma.enrollment.findMany({
      where: { studentId: { in: [...scope.studentIds] }, status: 'ACTIVE' },
      select: { branchId: true },
    });
    return [...new Set(rows.map((r) => r.branchId))];
  }
}
