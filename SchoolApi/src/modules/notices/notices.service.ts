import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { parseDate } from '../../core/common/dates';
import { OK, type OkDto } from '../../core/common/dto/ok.dto';
import {
  conflict,
  forbidden,
  forbiddenScope,
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
import type { Scope } from '../../core/rbac/scope/scope';
import { AttachmentsService } from './attachments.service';
import type {
  CreateNoticeDto,
  NoticeQueryDto,
  UpdateNoticeDto,
} from './dto/notice-input.dto';
import type { NoticeDto, NoticeReadsDto } from './dto/notice.dto';
import { NoticeTargetService } from './notice-target.service';
import { noticeInclude, toNoticeDto, type NoticeRow } from './notice.mapper';

/** Drafting, listing and read receipts of notices. */
@Injectable()
export class NoticesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly targets: NoticeTargetService,
    private readonly attachments: AttachmentsService,
    private readonly audit: AuditService,
  ) {}

  async list(
    user: AuthUser,
    scope: Scope,
    query: NoticeQueryDto,
  ): Promise<PageResult<NoticeDto>> {
    const reach: Prisma.NoticeWhereInput[] = [
      { status: 'PUBLISHED', recipients: { some: { userId: user.id } } },
      { authorId: user.id },
    ];
    if (scope.global) reach.push({});
    else if (!scope.guardian && (scope.schoolIds.size || scope.branchIds.size))
      reach.push(scope.managedBranchFilter());
    const where: Prisma.NoticeWhereInput = {
      AND: [{ OR: reach }, { branchId: query.branchId, status: query.status }],
    };
    const [rows, total] = await Promise.all([
      this.prisma.notice.findMany({
        where,
        include: noticeInclude(user.id),
        orderBy: [
          { pinned: 'desc' },
          { publishedAt: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
        ...toSkipTake(query),
      }),
      this.prisma.notice.count({ where }),
    ]);
    return toPageResult(await this.toDtos(rows), total, query);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateNoticeDto,
  ): Promise<NoticeDto> {
    if (scope.guardian) throw forbidden('Parents cannot write notices');
    const origin = await this.targets.validate(user, scope, dto.audience);
    const fileIds = await this.attachments.assertUsable(dto.attachmentFileIds, {
      schoolId: origin.schoolId,
      userId: user.id,
    });
    const created = await this.prisma.notice.create({
      data: {
        schoolId: origin.schoolId,
        branchId: origin.branchId,
        title: dto.title.trim(),
        body: dto.body,
        audience: toJson(origin.audience),
        attachmentFileIds: fileIds,
        expiresOn: dto.expiresOn ? parseDate(dto.expiresOn) : null,
        pinned: dto.pinned ?? false,
        authorId: user.id,
      },
    });
    return this.done(user, 'notice.create', created.id);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateNoticeDto,
  ): Promise<NoticeDto> {
    const notice = await this.load(user, id);
    if (notice.authorId !== user.id)
      throw forbidden('Only the author can edit the notice');
    if (notice.status !== 'DRAFT')
      throw conflict(`Notice is ${notice.status}; only DRAFT can be edited`);
    const origin = dto.audience
      ? await this.targets.validate(user, scope, dto.audience)
      : undefined;
    const fileIds = dto.attachmentFileIds
      ? await this.attachments.assertUsable(dto.attachmentFileIds, {
          schoolId: origin?.schoolId ?? notice.schoolId,
          userId: user.id,
        })
      : undefined;
    await this.prisma.notice.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        body: dto.body,
        schoolId: origin?.schoolId,
        branchId: origin ? origin.branchId : undefined,
        audience: origin ? toJson(origin.audience) : undefined,
        attachmentFileIds: fileIds,
        expiresOn: dto.expiresOn ? parseDate(dto.expiresOn) : undefined,
        pinned: dto.pinned,
      },
    });
    return this.done(user, 'notice.update', id, {
      title: notice.title,
      audience: notice.audience,
    });
  }

  async markRead(user: AuthUser, id: string): Promise<OkDto> {
    const row = await this.prisma.noticeRecipient.findUnique({
      where: { noticeId_userId: { noticeId: id, userId: user.id } },
      include: {
        notice: { select: { status: true, schoolId: true, branchId: true } },
      },
    });
    if (!row || row.notice.status !== 'PUBLISHED') throw notFound('Notice');
    if (row.readAt) return OK;
    await this.prisma.noticeRecipient.update({
      where: { id: row.id },
      data: { readAt: new Date() },
    });
    this.audit.stage({
      action: 'notice.read',
      entityType: 'Notice',
      entityId: id,
      schoolId: row.notice.schoolId,
      branchId: row.notice.branchId,
    });
    return OK;
  }

  async reads(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<NoticeReadsDto> {
    const notice = await this.load(user, id);
    if (notice.authorId !== user.id && !this.canManage(scope, notice))
      throw forbiddenScope('Only the author or management');
    const [total, read] = await Promise.all([
      this.prisma.noticeRecipient.count({ where: { noticeId: id } }),
      this.prisma.noticeRecipient.count({
        where: { noticeId: id, readAt: { not: null } },
      }),
    ]);
    return { total, read, unread: total - read };
  }

  canManage(
    scope: Scope,
    notice: { schoolId: string; branchId: string | null },
  ): boolean {
    return notice.branchId
      ? scope.canManageBranch({
          id: notice.branchId,
          schoolId: notice.schoolId,
        })
      : scope.canManageSchool(notice.schoolId);
  }

  async load(user: AuthUser, id: string): Promise<NoticeRow> {
    const row = await this.prisma.notice.findUnique({
      where: { id },
      include: noticeInclude(user.id),
    });
    if (!row) throw notFound('Notice');
    return row;
  }

  async toDtos(rows: NoticeRow[]): Promise<NoticeDto[]> {
    const files = await this.attachments.describe(
      rows.flatMap((r) => r.attachmentFileIds),
    );
    return rows.map((r) =>
      toNoticeDto(r, this.attachments.pick(files, r.attachmentFileIds)),
    );
  }

  async done(
    user: AuthUser,
    action: string,
    id: string,
    before?: unknown,
  ): Promise<NoticeDto> {
    const row = await this.load(user, id);
    const [dto] = await this.toDtos([row]);
    this.audit.stage({
      action,
      entityType: 'Notice',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before,
      after: { title: dto.title, status: dto.status, audience: dto.audience },
    });
    return dto;
  }
}
