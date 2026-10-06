import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { conflict } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../core/common/pagination/paginate';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { AttachmentsService } from '../notices/attachments.service';
import { SchoolPeopleService } from '../school-day/school-people.service';
import { StudentPlacementService } from '../school-day/student-placement.service';
import type { CreateThreadDto, ThreadQueryDto } from './dto/thread-input.dto';
import type { MessageRecipientDto, ThreadDto } from './dto/thread.dto';
import { MessageRecipientsService } from './message-recipients.service';
import { MessageSender } from './message-sender.service';
import { participantRole, pickStaffTarget } from './message-target';
import { ThreadAccessService } from './thread-access.service';
import { THREAD_INCLUDE } from './thread.mapper';
import { ThreadViewService } from './thread-view.service';

const UNREAD_SCAN_LIMIT = 500;

/** Starting threads and listing the caller's (or the branch's) threads. */
@Injectable()
export class ThreadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placements: StudentPlacementService,
    private readonly people: SchoolPeopleService,
    private readonly recipients: MessageRecipientsService,
    private readonly attachments: AttachmentsService,
    private readonly sender: MessageSender,
    private readonly access: ThreadAccessService,
    private readonly view: ThreadViewService,
    private readonly audit: AuditService,
  ) {}

  async recipientsFor(
    scope: Scope,
    studentId: string,
  ): Promise<MessageRecipientDto[]> {
    const placement = await this.placements.read(scope, studentId);
    return this.recipients.staffFor(placement);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateThreadDto,
  ): Promise<ThreadDto> {
    const placement = await this.placements.read(scope, dto.studentId);
    const fileIds = await this.attachments.assertUsable(dto.attachmentFileIds, {
      schoolId: placement.schoolId,
      userId: user.id,
    });
    const me = { userId: user.id, role: user.activeRole };
    let others: { userId: string; role: string }[];
    if (scope.guardian) {
      me.role = 'PARENT';
      const target = pickStaffTarget(
        await this.recipients.staffFor(placement),
        dto.staffUserId,
      );
      others = [{ userId: target.userId, role: participantRole(target) }];
    } else {
      const guardians = await this.people.guardianUserIds([dto.studentId]);
      if (guardians.length === 0)
        throw conflict('The student has no guardian with an app account');
      others = guardians.map((userId) => ({ userId, role: 'PARENT' }));
    }
    const participants = [me, ...others.filter((o) => o.userId !== me.userId)];
    const thread = await this.prisma.messageThread.create({
      data: {
        schoolId: placement.schoolId,
        branchId: placement.branchId,
        studentId: dto.studentId,
        subject: dto.subject.trim(),
        createdById: user.id,
        participants: { create: participants },
      },
    });
    this.audit.stage({
      action: 'messages.thread_create',
      entityType: 'MessageThread',
      entityId: thread.id,
      schoolId: thread.schoolId,
      branchId: thread.branchId,
      after: { studentId: dto.studentId, participants },
    });
    await this.sender.send({
      thread,
      senderId: user.id,
      senderRole: me.role,
      isStaff: !scope.guardian,
      body: dto.body,
      attachmentFileIds: fileIds,
    });
    const row = await this.prisma.messageThread.findUniqueOrThrow({
      where: { id: thread.id },
      include: THREAD_INCLUDE,
    });
    return this.view.toDto(row, user.id);
  }

  async list(
    user: AuthUser,
    scope: Scope,
    query: ThreadQueryDto,
  ): Promise<PageResult<ThreadDto>> {
    scope.assertGuardianStudent(query.studentId);
    if (query.scope === 'branch') return this.branchList(user, scope, query);
    const where: Prisma.MessageThreadWhereInput = {
      studentId: query.studentId,
      branchId: query.branchId,
      participants: { some: { userId: user.id } },
      OR: [
        { createdById: user.id },
        { messages: { some: { status: 'SENT' } } },
      ],
    };
    if (query.unread === 'true') {
      const rows = await this.prisma.messageThread.findMany({
        where,
        include: THREAD_INCLUDE,
        orderBy: { lastMessageAt: 'desc' },
        take: UNREAD_SCAN_LIMIT,
      });
      const all = await this.view.toDtos(rows, user.id);
      const unread = all.filter((t) => t.unreadCount > 0);
      const { skip, take } = toSkipTake(query);
      return toPageResult(
        unread.slice(skip, skip + take),
        unread.length,
        query,
      );
    }
    const [rows, total] = await Promise.all([
      this.prisma.messageThread.findMany({
        where,
        include: THREAD_INCLUDE,
        orderBy: { lastMessageAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.messageThread.count({ where }),
    ]);
    return toPageResult(await this.view.toDtos(rows, user.id), total, query);
  }

  private async branchList(
    user: AuthUser,
    scope: Scope,
    query: ThreadQueryDto,
  ): Promise<PageResult<ThreadDto>> {
    this.access.assertBranchView(user, scope);
    const where: Prisma.MessageThreadWhereInput = {
      AND: [
        scope.managedBranchFilter(),
        { studentId: query.studentId, branchId: query.branchId },
        { messages: { some: { status: 'SENT' } } },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.messageThread.findMany({
        where,
        include: THREAD_INCLUDE,
        orderBy: { lastMessageAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.messageThread.count({ where }),
    ]);
    await this.audit.recordNow({
      action: 'messages.branch_view',
      entityType: 'MessageThread',
      entityId: query.branchId ?? 'branch',
      branchId: query.branchId ?? null,
      after: {
        studentId: query.studentId ?? null,
        page: query.page,
        threadIds: rows.map((r) => r.id),
      },
    });
    return toPageResult(await this.view.toDtos(rows, null), total, query);
  }
}
