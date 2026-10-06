import { Injectable } from '@nestjs/common';
import type {
  Complaint,
  ComplaintStatus,
  Prisma,
} from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import {
  conflict,
  forbidden,
  forbiddenScope,
  notFound,
} from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  canManageComplaint,
  canViewComplaint,
  isLeader,
} from './complaint-access';
import { ComplaintAttachments } from './complaint-attachments';
import { ComplaintEscalationService } from './complaint-escalation.service';
import { ComplaintNotifier } from './complaint-notifier';
import { ComplaintRouterService } from './complaint-router.service';
import { isOpen, REOPEN_WINDOW_MS } from './complaint-status';
import type {
  AssignComplaintDto,
  ComplaintReasonDto,
  ComplaintUpdateInputDto,
} from './dto/complaint-input.dto';

interface Transition {
  actorId: string;
  status?: ComplaintStatus;
  data: Prisma.ComplaintUncheckedUpdateManyInput;
  message: string;
  attachmentFileIds?: string[];
}

/** Assign, reply, escalate, close and reopen. */
@Injectable()
export class ComplaintActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly router: ComplaintRouterService,
    private readonly escalation: ComplaintEscalationService,
    private readonly attachments: ComplaintAttachments,
    private readonly notifier: ComplaintNotifier,
    private readonly audit: AuditService,
  ) {}

  async assign(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: AssignComplaintDto,
  ): Promise<void> {
    const row = await this.load(user, scope, id);
    if (!canManageComplaint(scope, row)) throw forbiddenScope();
    if (!isOpen(row.status)) throw conflict('Complaint is no longer open');
    if (dto.assigneeUserId === row.againstUserId) {
      throw forbidden(
        'A complaint cannot be assigned to the person it is about',
      );
    }
    const assignee = await this.prisma.user.findFirst({
      where: { id: dto.assigneeUserId, status: 'ACTIVE' },
      select: { id: true, name: true },
    });
    if (!assignee) throw notFound('User');
    const updated = await this.transition(row, {
      actorId: user.id,
      status: 'ASSIGNED',
      data: { status: 'ASSIGNED', assigneeId: assignee.id },
      message: `Assigned to ${assignee.name}`,
    });
    this.stage('complaints.assign', row, {
      status: 'ASSIGNED',
      assigneeId: assignee.id,
    });
    await this.notifier.statusChanged(updated, 'ASSIGNED', user.id);
    await this.notifier.assigned(updated, assignee.id, user.id);
  }

  async addUpdate(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: ComplaintUpdateInputDto,
  ): Promise<void> {
    const row = await this.load(user, scope, id);
    this.assertParty(user, row);
    if (row.status === 'CLOSED') throw conflict('Complaint is closed');
    if (dto.status) {
      if (row.assigneeId !== user.id) {
        throw forbidden('Only the assignee can change the status');
      }
      if (!isOpen(row.status)) throw conflict('Complaint is no longer open');
    }
    const fileIds = await this.attachments.assertUsable(
      dto.attachmentFileIds,
      row.schoolId,
      user.id,
    );
    const data: Prisma.ComplaintUncheckedUpdateManyInput = dto.status
      ? {
          status: dto.status,
          resolvedAt: dto.status === 'RESOLVED' ? new Date() : undefined,
        }
      : {};
    const updated = await this.transition(row, {
      actorId: user.id,
      status: dto.status,
      data,
      message: dto.message.trim(),
      attachmentFileIds: fileIds,
    });
    this.stage('complaints.update', row, {
      status: dto.status ?? row.status,
      message: dto.message,
    });
    if (dto.status) {
      await this.notifier.statusChanged(updated, dto.status, user.id);
      return;
    }
    const other =
      user.id === row.complainantId ? row.assigneeId : row.complainantId;
    await this.notifier.tell(
      other,
      updated,
      `New reply on complaint ${row.ticketNo}`,
      user.id,
    );
  }

  async escalate(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: ComplaintReasonDto,
  ): Promise<void> {
    const row = await this.load(user, scope, id);
    this.assertParty(user, row);
    await this.escalation.escalate(row, user.id, dto.reason?.trim());
  }

  async close(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: ComplaintReasonDto,
  ): Promise<void> {
    const row = await this.load(user, scope, id);
    const leader = isLeader(user) && canManageComplaint(scope, row);
    if (row.complainantId !== user.id && !leader) {
      throw forbidden('Only the complainant or the principal can close');
    }
    if (row.status !== 'RESOLVED') {
      throw conflict('Only resolved complaints can be closed');
    }
    const updated = await this.transition(row, {
      actorId: user.id,
      status: 'CLOSED',
      data: { status: 'CLOSED', closedAt: new Date() },
      message: dto.reason?.trim() || 'Closed',
    });
    this.stage('complaints.close', row, { status: 'CLOSED' });
    await this.notifier.statusChanged(updated, 'CLOSED', user.id);
  }

  async reopen(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: ComplaintReasonDto,
  ): Promise<void> {
    const row = await this.load(user, scope, id);
    if (row.complainantId !== user.id) {
      throw forbidden('Only the complainant can reopen');
    }
    const resolvedAt = row.resolvedAt?.getTime() ?? 0;
    if (
      row.status !== 'RESOLVED' ||
      Date.now() - resolvedAt > REOPEN_WINDOW_MS
    ) {
      throw conflict(
        'Only complaints resolved within the last 7 days can be reopened',
      );
    }
    const slaDueAt = await this.router.slaDueAt(row.branchId, row.category);
    const updated = await this.transition(row, {
      actorId: user.id,
      status: 'REOPENED',
      data: { status: 'REOPENED', resolvedAt: null, slaDueAt },
      message: dto.reason?.trim() || 'Reopened',
    });
    this.stage('complaints.reopen', row, { status: 'REOPENED' });
    await this.notifier.tell(
      row.assigneeId,
      updated,
      `Complaint ${row.ticketNo} was reopened`,
      user.id,
    );
  }

  private async load(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<Complaint> {
    const row = await this.prisma.complaint.findUnique({ where: { id } });
    if (!row || row.againstUserId === user.id) throw notFound('Complaint');
    if (!canViewComplaint(user, scope, row)) {
      throw scope.guardian ? notFound('Complaint') : forbiddenScope();
    }
    return row;
  }

  private assertParty(user: AuthUser, row: Complaint): void {
    if (row.complainantId !== user.id && row.assigneeId !== user.id) {
      throw forbidden('Only the complainant or the assignee can do this');
    }
  }

  /** Applies a change only if the status is unchanged since it was read. */
  private transition(row: Complaint, t: Transition): Promise<Complaint> {
    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.complaint.updateMany({
        where: { id: row.id, status: row.status },
        data: t.data,
      });
      if (claimed.count === 0) throw conflict('Complaint changed meanwhile');
      await tx.complaintUpdate.create({
        data: {
          complaintId: row.id,
          authorId: t.actorId,
          message: t.message,
          status: t.status ?? null,
          attachmentFileIds: t.attachmentFileIds ?? [],
        },
      });
      return tx.complaint.findUniqueOrThrow({ where: { id: row.id } });
    });
  }

  private stage(action: string, row: Complaint, after: unknown): void {
    this.audit.stage({
      action,
      entityType: 'Complaint',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: { status: row.status, assigneeId: row.assigneeId },
      after,
    });
  }
}
