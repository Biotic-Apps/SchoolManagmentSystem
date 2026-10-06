import { Injectable } from '@nestjs/common';
import type { MeetingStatus, Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { parseDate } from '../../core/common/dates';
import { conflict, forbidden, invalid } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type {
  CompleteMeetingDto,
  MeetingReasonDto,
} from './dto/meeting-input.dto';
import type { MeetingDto } from './dto/meeting.dto';
import {
  MEETING_INCLUDE,
  toMeetingDto,
  type MeetingRow,
} from './meeting.mapper';
import { MeetingNotifier } from './meeting-notifier';
import { MeetingsService } from './meetings.service';

/** Cancel (either party), complete and no-show (staff participant). */
@Injectable()
export class MeetingActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meetings: MeetingsService,
    private readonly notifier: MeetingNotifier,
    private readonly audit: AuditService,
  ) {}

  async cancel(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: MeetingReasonDto,
  ): Promise<MeetingDto> {
    const row = await this.meetings.load(user, scope, id);
    if (row.staffUserId !== user.id && row.guardian.userId !== user.id) {
      throw forbidden('Only participants can cancel a meeting');
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await this.finish(tx, row, 'CANCELLED', {
        reason: dto.reason?.trim() || null,
      });
      if (row.slotId) {
        await tx.meetingSlot.updateMany({
          where: { id: row.slotId, status: 'BOOKED' },
          data: { status: 'OPEN' },
        });
      }
      return result;
    });
    this.stage('meetings.cancel', row, {
      status: 'CANCELLED',
      reason: dto.reason,
    });
    await this.notifier.others(
      row,
      user.id,
      'Meeting cancelled',
      dto.reason?.trim() || undefined,
    );
    return toMeetingDto(updated, scope.guardian);
  }

  async complete(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: CompleteMeetingDto,
  ): Promise<MeetingDto> {
    const row = await this.loadAsStaff(user, scope, id);
    const followUps = dto.followUps ?? [];
    await this.assertOwners(followUps.map((f) => f.ownerUserId));
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await this.finish(tx, row, 'COMPLETED', {
        notes: dto.notes.trim(),
        summary: dto.summary?.trim() || null,
        shareSummary: dto.shareSummaryWithParent,
      });
      if (followUps.length > 0) {
        await tx.meetingFollowUp.createMany({
          data: followUps.map((f) => ({
            meetingId: row.id,
            title: f.title.trim(),
            ownerUserId: f.ownerUserId,
            dueDate: parseDate(f.dueDate),
          })),
        });
      }
      return tx.meeting.findUniqueOrThrow({
        where: { id: result.id },
        include: MEETING_INCLUDE,
      });
    });
    this.stage('meetings.complete', row, {
      status: 'COMPLETED',
      shareSummary: dto.shareSummaryWithParent,
      followUps: followUps.length,
    });
    await this.notifier.others(
      row,
      user.id,
      'Meeting completed',
      dto.shareSummaryWithParent && dto.summary ? dto.summary : undefined,
    );
    const owners = followUps
      .map((f) => f.ownerUserId)
      .filter((owner) => owner !== user.id);
    await this.notifier.send(owners, row, 'New meeting follow-up');
    return toMeetingDto(updated, scope.guardian);
  }

  async noShow(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: MeetingReasonDto,
  ): Promise<MeetingDto> {
    const row = await this.loadAsStaff(user, scope, id);
    const updated = await this.prisma.$transaction((tx) =>
      this.finish(tx, row, 'NO_SHOW', { reason: dto.reason?.trim() || null }),
    );
    this.stage('meetings.noShow', row, { status: 'NO_SHOW' });
    await this.notifier.others(row, user.id, 'Meeting marked as missed');
    return toMeetingDto(updated, scope.guardian);
  }

  private async loadAsStaff(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<MeetingRow> {
    const row = await this.meetings.load(user, scope, id);
    if (row.staffUserId !== user.id) {
      throw forbidden('Only the staff participant can do this');
    }
    return row;
  }

  /** Moves a SCHEDULED meeting to a final status (409 if it changed meanwhile). */
  private async finish(
    tx: Prisma.TransactionClient,
    row: MeetingRow,
    status: MeetingStatus,
    data: Prisma.MeetingUpdateManyMutationInput,
  ): Promise<MeetingRow> {
    const claimed = await tx.meeting.updateMany({
      where: { id: row.id, status: 'SCHEDULED' },
      data: { ...data, status },
    });
    if (claimed.count === 0) {
      throw conflict('Only scheduled meetings can be changed');
    }
    return tx.meeting.findUniqueOrThrow({
      where: { id: row.id },
      include: MEETING_INCLUDE,
    });
  }

  private async assertOwners(userIds: string[]): Promise<void> {
    const ids = [...new Set(userIds)];
    if (ids.length === 0) return;
    const found = await this.prisma.user.count({
      where: { id: { in: ids }, status: 'ACTIVE' },
    });
    if (found !== ids.length) throw invalid('Follow-up owner not found');
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
