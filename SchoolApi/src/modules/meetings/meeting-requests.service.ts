import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { formatDate } from '../../core/common/dates';
import { conflict, forbidden, notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { StudentPlacementService } from '../school-day/student-placement.service';
import type { MeetingReasonDto } from './dto/meeting-input.dto';
import type {
  AcceptMeetingDto,
  ParentMeetingRequestDto,
} from './dto/meeting-request.dto';
import type { MeetingDto } from './dto/meeting.dto';
import {
  MEETING_INCLUDE,
  toMeetingDto,
  type MeetingRow,
} from './meeting.mapper';
import { MeetingNotifier } from './meeting-notifier';
import { MeetingTeachersService } from './meeting-teachers.service';
import { addMinutes, assertMeetingTimes } from './meeting-times';
import { isLeader, MeetingsService } from './meetings.service';

/** Default length of a meeting a parent asks for without an end time. */
const REQUEST_MINUTES = 30;

/**
 * Parent asks one of the child's teachers for a time (no open slot needed):
 * REQUESTED until the teacher (or a principal) accepts → SCHEDULED, or
 * declines → CANCELLED.
 */
@Injectable()
export class MeetingRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placements: StudentPlacementService,
    private readonly teachers: MeetingTeachersService,
    private readonly meetings: MeetingsService,
    private readonly notifier: MeetingNotifier,
    private readonly audit: AuditService,
  ) {}

  /** Returns the new meeting id. */
  async request(
    user: AuthUser,
    scope: Scope,
    dto: ParentMeetingRequestDto,
  ): Promise<string> {
    if (!scope.guardian) {
      throw forbidden('Only parents can ask for a meeting time');
    }
    const placement = await this.placements.read(scope, dto.studentId);
    const guardian = await this.prisma.guardian.findUnique({
      where: { userId: user.id },
      select: { id: true, userId: true },
    });
    if (!guardian) throw notFound('Guardian');
    const teachers = await this.teachers.forPlacement(placement);
    if (!teachers.some((t) => t.userId === dto.staffUserId)) {
      throw notFound('Teacher');
    }
    const endTime = dto.endTime ?? addMinutes(dto.startTime, REQUEST_MINUTES);
    const date = assertMeetingTimes(dto.date, dto.startTime, endTime);
    const pending = await this.prisma.meeting.findFirst({
      where: {
        status: 'REQUESTED',
        guardianId: guardian.id,
        studentId: placement.studentId,
        staffUserId: dto.staffUserId,
      },
      select: { id: true },
    });
    if (pending) {
      throw conflict(
        'You already asked this teacher for a meeting. Wait for their reply.',
      );
    }
    const meeting = await this.prisma.meeting.create({
      data: {
        schoolId: placement.schoolId,
        branchId: placement.branchId,
        studentId: placement.studentId,
        guardianId: guardian.id,
        staffUserId: dto.staffUserId,
        date,
        startTime: dto.startTime,
        endTime,
        mode: dto.mode,
        agenda: dto.agenda.trim(),
        status: 'REQUESTED',
        requestedById: user.id,
      },
    });
    this.audit.stage({
      action: 'meetings.parentRequest',
      entityType: 'Meeting',
      entityId: meeting.id,
      schoolId: meeting.schoolId,
      branchId: meeting.branchId,
      after: {
        status: 'REQUESTED',
        studentId: meeting.studentId,
        staffUserId: meeting.staffUserId,
      },
    });
    await this.notifier.send(
      [dto.staffUserId],
      { ...meeting, guardian },
      `Meeting request from ${placement.name}'s parent`,
      `Prefers ${dto.date} at ${dto.startTime}: ${meeting.agenda}`,
    );
    return meeting.id;
  }

  async accept(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: AcceptMeetingDto,
  ): Promise<MeetingDto> {
    const row = await this.loadAsHost(user, scope, id);
    const startTime = dto.startTime ?? row.startTime;
    const endTime = dto.endTime ?? row.endTime;
    const date = assertMeetingTimes(
      dto.date ?? formatDate(row.date),
      startTime,
      endTime,
    );
    const updated = await this.decide(row, {
      status: 'SCHEDULED',
      date,
      startTime,
      endTime,
      mode: dto.mode ?? row.mode,
      location: dto.location?.trim() || row.location,
    });
    this.stage('meetings.accept', row, {
      status: 'SCHEDULED',
      date: formatDate(date),
      startTime,
      endTime,
    });
    await this.notifier.others(updated, user.id, 'Meeting confirmed');
    return toMeetingDto(updated, scope.guardian);
  }

  async decline(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: MeetingReasonDto,
  ): Promise<MeetingDto> {
    const row = await this.loadAsHost(user, scope, id);
    const reason = dto.reason?.trim() || null;
    const updated = await this.decide(row, { status: 'CANCELLED', reason });
    this.stage('meetings.decline', row, { status: 'CANCELLED', reason });
    await this.notifier.others(
      updated,
      user.id,
      'Meeting request declined',
      reason ?? undefined,
    );
    return toMeetingDto(updated, scope.guardian);
  }

  /** The asked teacher, or a principal / super admin managing the branch. */
  private async loadAsHost(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<MeetingRow> {
    const row = await this.meetings.load(user, scope, id);
    if (scope.guardian || (row.staffUserId !== user.id && !isLeader(user))) {
      throw forbidden('Only the teacher asked can answer this request');
    }
    return row;
  }

  /** Moves a REQUESTED meeting on (409 if it was answered or withdrawn meanwhile). */
  private async decide(
    row: MeetingRow,
    data: Prisma.MeetingUpdateManyMutationInput,
  ): Promise<MeetingRow> {
    const claimed = await this.prisma.meeting.updateMany({
      where: { id: row.id, status: 'REQUESTED' },
      data,
    });
    if (claimed.count === 0) {
      throw conflict('This request was already answered or withdrawn');
    }
    return this.prisma.meeting.findUniqueOrThrow({
      where: { id: row.id },
      include: MEETING_INCLUDE,
    });
  }

  private stage(action: string, row: MeetingRow, after: unknown): void {
    this.audit.stage({
      action,
      entityType: 'Meeting',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: { status: row.status },
      after,
    });
  }
}
