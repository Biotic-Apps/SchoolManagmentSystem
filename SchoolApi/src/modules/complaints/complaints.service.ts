import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import {
  forbiddenScope,
  invalid,
  notFound,
} from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../core/common/pagination/paginate';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  formatNumber,
  SequenceService,
} from '../../core/sequences/sequence.service';
import { StudentPlacementService } from '../school-day/student-placement.service';
import { canViewComplaint, notAgainst } from './complaint-access';
import { ComplaintAttachments } from './complaint-attachments';
import { ComplaintNotifier } from './complaint-notifier';
import { ComplaintOriginService } from './complaint-origin.service';
import { ComplaintRouterService } from './complaint-router.service';
import { routeComplaint } from './complaint-routing';
import {
  attachmentIds,
  COMPLAINT_DETAIL_INCLUDE,
  COMPLAINT_INCLUDE,
  toComplaintDto,
  type ComplaintRow,
} from './complaint.mapper';
import type {
  ComplaintBox,
  ComplaintQueryDto,
  CreateComplaintDto,
} from './dto/complaint-input.dto';
import type { ComplaintDto } from './dto/complaint.dto';

/** Filing, listing and reading complaints. */
@Injectable()
export class ComplaintsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placements: StudentPlacementService,
    private readonly origins: ComplaintOriginService,
    private readonly router: ComplaintRouterService,
    private readonly attachments: ComplaintAttachments,
    private readonly sequences: SequenceService,
    private readonly notifier: ComplaintNotifier,
    private readonly audit: AuditService,
  ) {}

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateComplaintDto,
  ): Promise<ComplaintDto> {
    const placement = dto.studentId
      ? await this.placements.read(scope, dto.studentId)
      : null;
    const origin = placement
      ? { schoolId: placement.schoolId, branchId: placement.branchId }
      : await this.origins.resolve(user, scope);
    const againstUserId = await this.checkAgainst(user, dto.againstUserId);
    const fileIds = await this.attachments.assertUsable(
      dto.attachmentFileIds,
      origin.schoolId,
      user.id,
    );
    const candidates = await this.router.candidates(
      origin.branchId,
      placement?.sectionId ?? null,
    );
    const assigneeId = routeComplaint({
      complainantId: user.id,
      complainantRole: user.activeRole,
      category: dto.category,
      againstUserId,
      candidates,
    });
    const slaDueAt = await this.router.slaDueAt(origin.branchId, dto.category);
    const year = new Date().getFullYear();
    const row = await this.prisma.$transaction(async (tx) => {
      const seq = await this.sequences.next(
        tx,
        `complaint:${origin.schoolId}:${year}`,
      );
      return tx.complaint.create({
        data: {
          schoolId: origin.schoolId,
          branchId: origin.branchId,
          ticketNo: formatNumber('CMP', year, seq),
          category: dto.category,
          subject: dto.subject.trim(),
          description: dto.description.trim(),
          status: assigneeId ? 'ASSIGNED' : 'SUBMITTED',
          slaDueAt,
          complainantId: user.id,
          complainantRole: user.activeRole,
          anonymous: dto.anonymous ?? false,
          againstUserId,
          studentId: placement?.studentId ?? null,
          assigneeId,
          attachmentFileIds: fileIds,
        },
        include: COMPLAINT_DETAIL_INCLUDE,
      });
    });
    this.audit.stage({
      action: 'complaints.create',
      entityType: 'Complaint',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: {
        ticketNo: row.ticketNo,
        category: row.category,
        status: row.status,
        assigneeId,
        againstUserId,
        anonymous: row.anonymous,
      },
    });
    await this.notifier.assigned(row, assigneeId, user.id);
    return toComplaintDto(row, user, await this.attachments.resolve(fileIds));
  }

  async list(
    user: AuthUser,
    scope: Scope,
    query: ComplaintQueryDto,
  ): Promise<PageResult<ComplaintDto>> {
    const where: Prisma.ComplaintWhereInput = {
      AND: [
        this.boxFilter(user, scope, query.box ?? 'mine'),
        notAgainst(user.id),
        { status: query.status, category: query.category },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        include: COMPLAINT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.complaint.count({ where }),
    ]);
    const files = await this.attachments.resolve(rows.flatMap(attachmentIds));
    const now = new Date();
    return toPageResult(
      rows.map((row) => toComplaintDto(row, user, files, now)),
      total,
      query,
    );
  }

  async get(user: AuthUser, scope: Scope, id: string): Promise<ComplaintDto> {
    const row = await this.prisma.complaint.findUnique({
      where: { id },
      include: COMPLAINT_DETAIL_INCLUDE,
    });
    if (!row || row.againstUserId === user.id) throw notFound('Complaint');
    if (!canViewComplaint(user, scope, row)) {
      throw scope.guardian ? notFound('Complaint') : forbiddenScope();
    }
    return this.toDto(user, row);
  }

  /** Result of an action the caller was allowed to take (they may have handed it on). */
  async afterAction(user: AuthUser, id: string): Promise<ComplaintDto> {
    const row = await this.prisma.complaint.findUniqueOrThrow({
      where: { id },
      include: COMPLAINT_DETAIL_INCLUDE,
    });
    return this.toDto(user, row);
  }

  private async toDto(
    user: AuthUser,
    row: ComplaintRow,
  ): Promise<ComplaintDto> {
    return toComplaintDto(
      row,
      user,
      await this.attachments.resolve(attachmentIds(row)),
    );
  }

  private boxFilter(
    user: AuthUser,
    scope: Scope,
    box: ComplaintBox,
  ): Prisma.ComplaintWhereInput {
    if (box === 'mine') return { complainantId: user.id };
    if (box === 'assigned') return { assigneeId: user.id };
    const manages =
      scope.global || scope.branchIds.size > 0 || scope.schoolIds.size > 0;
    if (scope.guardian || scope.sectionLimited || !manages) {
      throw forbiddenScope('Branch-wide complaints need a management role');
    }
    return scope.managedBranchFilter();
  }

  private async checkAgainst(
    user: AuthUser,
    againstUserId: string | undefined,
  ): Promise<string | null> {
    if (!againstUserId) return null;
    if (againstUserId === user.id) {
      throw invalid('You cannot file a complaint against yourself');
    }
    const exists = await this.prisma.user.count({
      where: { id: againstUserId },
    });
    if (!exists) throw notFound('User');
    return againstUserId;
  }
}
