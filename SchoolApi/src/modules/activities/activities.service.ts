import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { ApprovalService } from '../../core/approvals/approval.service';
import { AuditService } from '../../core/audit/audit.service';
import { parseDate } from '../../core/common/dates';
import {
  conflict,
  forbiddenScope,
  invalid,
  notFound,
} from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../core/common/pagination/paginate';
import { toJson } from '../../core/common/prisma-json';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RoleKey } from '../../core/rbac/role-key.enum';
import type { Scope } from '../../core/rbac/scope/scope';
import { localDateTime } from '../school-day/clock';
import { ActivityAccessService } from './activity-access.service';
import { ActivityAudienceService } from './activity-audience.service';
import {
  ACTIVITY_INCLUDE,
  toActivityDto,
  type ActivityRow,
} from './activity.mapper';
import type {
  ActivityQueryDto,
  CreateActivityDto,
  UpdateActivityDto,
} from './dto/activity-input.dto';
import type { ActivityDto } from './dto/activity.dto';

const DAY_MS = 86_400_000;

/** Activity proposals, listing and editing (approval runs via the handler). */
@Injectable()
export class ActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ActivityAccessService,
    private readonly audiences: ActivityAudienceService,
    private readonly approvals: ApprovalService,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: ActivityQueryDto,
  ): Promise<PageResult<ActivityDto>> {
    const where: Prisma.ActivityWhereInput = {
      AND: [
        await this.access.visibleFilter(scope),
        {
          branchId: query.branchId,
          type: query.type,
          status: query.status,
          startAt: {
            gte: query.from ? localDateTime(query.from, '00:00') : undefined,
            lt: query.to
              ? new Date(localDateTime(query.to, '00:00').getTime() + DAY_MS)
              : undefined,
          },
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        include: ACTIVITY_INCLUDE,
        orderBy: { startAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.activity.count({ where }),
    ]);
    return toPageResult(
      rows.map((r) => toActivityDto(r)),
      total,
      query,
    );
  }

  async get(scope: Scope, id: string): Promise<ActivityDto> {
    return toActivityDto(await this.access.load(scope, id));
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateActivityDto,
  ): Promise<ActivityDto> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId },
      select: { id: true, schoolId: true },
    });
    if (!branch) throw notFound('Branch');
    if (scope.guardian || !scope.canReadBranch(branch)) throw forbiddenScope();
    const audience = await this.audiences.validate(branch, dto.audience);
    const times = this.times(dto.startAt, dto.endAt);

    const id = await this.prisma.$transaction(async (tx) => {
      const created = await tx.activity.create({
        data: {
          schoolId: branch.schoolId,
          branchId: branch.id,
          type: dto.type,
          title: dto.title.trim(),
          description: dto.description,
          startAt: times.startAt,
          endAt: times.endAt,
          venue: dto.venue ?? null,
          audience: toJson(audience),
          consentRequired: dto.consentRequired,
          consentDeadline: dto.consentDeadline
            ? parseDate(dto.consentDeadline)
            : null,
          feeMinor: dto.feeMinor === undefined ? null : BigInt(dto.feeMinor),
          maxParticipants: dto.maxParticipants ?? null,
          proposedById: user.id,
        },
      });
      const approval = await this.approvals.create(
        {
          type: 'ACTIVITY',
          entityType: 'Activity',
          entityId: created.id,
          schoolId: branch.schoolId,
          branchId: branch.id,
          requestedById: user.id,
          title: `Activity: ${created.title}`,
          payload: { activityId: created.id },
          steps: [{ approverRole: RoleKey.PRINCIPAL }],
        },
        tx,
      );
      await tx.activity.update({
        where: { id: created.id },
        data: { approvalId: approval.id },
      });
      return created.id;
    });
    return this.done('activity.create', id);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateActivityDto,
  ): Promise<ActivityDto> {
    const row = await this.access.load(scope, id);
    this.access.assertEditor(user, scope, row);
    if (row.status !== 'PROPOSED')
      throw conflict(`Activity is ${row.status}; only PROPOSED can be edited`);
    const times = this.times(
      dto.startAt ?? row.startAt.toISOString(),
      dto.endAt ?? row.endAt.toISOString(),
    );
    const audience = dto.audience
      ? await this.audiences.validate(
          { id: row.branchId, schoolId: row.schoolId },
          dto.audience,
        )
      : undefined;
    await this.prisma.activity.update({
      where: { id },
      data: {
        type: dto.type,
        title: dto.title?.trim(),
        description: dto.description,
        startAt: times.startAt,
        endAt: times.endAt,
        venue: dto.venue,
        audience: audience ? toJson(audience) : undefined,
        consentRequired: dto.consentRequired,
        consentDeadline: dto.consentDeadline
          ? parseDate(dto.consentDeadline)
          : undefined,
        feeMinor: dto.feeMinor === undefined ? undefined : BigInt(dto.feeMinor),
        maxParticipants: dto.maxParticipants,
      },
    });
    return this.done('activity.update', id, toActivityDto(row));
  }

  private times(startAt: string, endAt: string) {
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (end.getTime() < start.getTime())
      throw invalid('endAt must not be before startAt');
    return { startAt: start, endAt: end };
  }

  async done(
    action: string,
    id: string,
    before?: ActivityDto,
  ): Promise<ActivityDto> {
    const row: ActivityRow = await this.prisma.activity.findUniqueOrThrow({
      where: { id },
      include: ACTIVITY_INCLUDE,
    });
    const dto = toActivityDto(row);
    this.audit.stage({
      action,
      entityType: 'Activity',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before,
      after: dto,
    });
    return dto;
  }
}
