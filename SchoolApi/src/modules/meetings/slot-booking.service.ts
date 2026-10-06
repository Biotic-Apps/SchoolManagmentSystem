import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { parseDate } from '../../core/common/dates';
import {
  conflict,
  forbidden,
  invalid,
  notFound,
} from '../../core/common/errors/errors';
import { isPrismaKnownError } from '../../core/common/errors/prisma-error.mapper';
import type { AuthUser } from '../../core/common/types/auth-user';
import { today } from '../../core/common/week';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../school-day/school-people.service';
import { StudentPlacementService } from '../school-day/student-placement.service';
import type { CreateMeetingDto } from './dto/meeting-input.dto';
import { MeetingNotifier } from './meeting-notifier';
import { assertMeetingTimes } from './meeting-times';

const SLOT_TAKEN = 'Slot already taken';

/** Parents book an open slot (one winner per slot); staff request a meeting directly. */
@Injectable()
export class SlotBookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placements: StudentPlacementService,
    private readonly people: SchoolPeopleService,
    private readonly notifier: MeetingNotifier,
    private readonly audit: AuditService,
  ) {}

  /** Returns the new meeting id. */
  create(user: AuthUser, scope: Scope, dto: CreateMeetingDto): Promise<string> {
    if (scope.guardian) {
      if (!dto.slotId) throw invalid('slotId is required');
      return this.book(user, scope, { ...dto, slotId: dto.slotId });
    }
    if (dto.slotId) throw forbidden('Only parents book slots');
    return this.request(user, scope, dto);
  }

  async book(
    user: AuthUser,
    scope: Scope,
    dto: { slotId: string; studentId: string; agenda: string },
  ): Promise<string> {
    const placement = await this.placements.read(scope, dto.studentId);
    const guardian = await this.prisma.guardian.findUnique({
      where: { userId: user.id },
      select: { id: true, userId: true },
    });
    if (!guardian) throw notFound('Guardian');
    const slot = await this.prisma.meetingSlot.findUnique({
      where: { id: dto.slotId },
    });
    if (!slot || slot.branchId !== placement.branchId) {
      throw notFound('Meeting slot');
    }
    if (slot.status !== 'OPEN') throw conflict(SLOT_TAKEN);
    if (slot.date < today()) throw invalid('Slot is in the past');
    const meeting = await this.prisma
      .$transaction(async (tx) => {
        const claimed = await tx.meetingSlot.updateMany({
          where: { id: slot.id, status: 'OPEN' },
          data: { status: 'BOOKED' },
        });
        if (claimed.count === 0) throw conflict(SLOT_TAKEN);
        return tx.meeting.create({
          data: {
            schoolId: slot.schoolId,
            branchId: slot.branchId,
            slotId: slot.id,
            studentId: placement.studentId,
            guardianId: guardian.id,
            staffUserId: slot.staffUserId,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            mode: slot.mode,
            location: slot.location,
            agenda: dto.agenda.trim(),
            requestedById: user.id,
          },
        });
      })
      .catch((error: unknown) => {
        if (isPrismaKnownError(error) && error.code === 'P2002') {
          throw conflict(SLOT_TAKEN);
        }
        throw error;
      });
    this.audit.stage({
      action: 'meetings.book',
      entityType: 'Meeting',
      entityId: meeting.id,
      schoolId: meeting.schoolId,
      branchId: meeting.branchId,
      after: { slotId: slot.id, studentId: meeting.studentId },
    });
    await this.notifier.others(
      { ...meeting, guardian },
      user.id,
      `Meeting booked by ${placement.name}'s parent`,
    );
    return meeting.id;
  }

  async request(
    user: AuthUser,
    scope: Scope,
    dto: CreateMeetingDto,
  ): Promise<string> {
    const placement = await this.placements.read(scope, dto.studentId);
    if (!(await this.people.staffOfUser(user.id))) {
      throw forbidden('Only staff can request meetings');
    }
    const link = await this.prisma.studentGuardian.findFirst({
      where: {
        studentId: placement.studentId,
        guardianId: dto.guardianId,
        status: 'VERIFIED',
      },
      select: { guardian: { select: { id: true, userId: true } } },
    });
    if (!link) throw notFound('Guardian');
    assertMeetingTimes(dto.date!, dto.startTime!, dto.endTime!);
    const meeting = await this.prisma.meeting.create({
      data: {
        schoolId: placement.schoolId,
        branchId: placement.branchId,
        studentId: placement.studentId,
        guardianId: link.guardian.id,
        staffUserId: user.id,
        date: parseDate(dto.date!),
        startTime: dto.startTime!,
        endTime: dto.endTime!,
        mode: dto.mode!,
        location: dto.location?.trim() || null,
        agenda: dto.agenda.trim(),
        requestedById: user.id,
      },
    });
    this.audit.stage({
      action: 'meetings.request',
      entityType: 'Meeting',
      entityId: meeting.id,
      schoolId: meeting.schoolId,
      branchId: meeting.branchId,
      after: { studentId: meeting.studentId, guardianId: meeting.guardianId },
    });
    await this.notifier.others(
      { ...meeting, guardian: link.guardian },
      user.id,
      `Meeting requested about ${placement.name}`,
    );
    return meeting.id;
  }
}
