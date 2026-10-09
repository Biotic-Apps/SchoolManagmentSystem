import { Injectable } from '@nestjs/common';
import type { DiaryEntry, Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { formatDate, parseDate } from '../../core/common/dates';
import {
  conflict,
  forbidden,
  invalid,
  notFound,
  recordLocked,
} from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { today } from '../../core/common/week';
import { FileRefService } from '../../core/files/file-ref.service';
import { ClientRequestService } from '../../core/idempotency/client-request.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { BranchSettingsReader } from '../branches/settings/branch-settings.reader';
import { localTime } from '../school-day/clock';
import { WorkingDayService } from '../school-day/working-day.service';
import { DiaryAccessService } from './diary-access.service';
import { DIARY_INCLUDE, DiaryMapper } from './diary.mapper';
import type {
  DiaryEntryDto,
  DiaryQueryDto,
  SaveDiaryDto,
} from './dto/diary.dto';

const MAX_RANGE_DAYS = 62;

/** Diary drafts (H)(X)(O); published entries editable until closing time. */
@Injectable()
export class DiaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: DiaryAccessService,
    private readonly mapper: DiaryMapper,
    private readonly files: FileRefService,
    private readonly requests: ClientRequestService,
    private readonly settings: BranchSettingsReader,
    private readonly workingDays: WorkingDayService,
    private readonly audit: AuditService,
  ) {}

  async list(scope: Scope, query: DiaryQueryDto): Promise<DiaryEntryDto[]> {
    const noDates = !query.date && !query.from && !query.to;
    // A status queue (moderation) without dates covers the whole allowed range.
    const start =
      noDates && query.status
        ? new Date(today().getTime() - MAX_RANGE_DAYS * 86_400_000)
        : today();
    const from = parseDate(query.date ?? query.from ?? formatDate(start));
    const to = parseDate(
      query.date ?? query.to ?? formatDate(noDates ? today() : from),
    );
    if (to < from) throw invalid('to must be on or after from');
    if ((to.getTime() - from.getTime()) / 86_400_000 > MAX_RANGE_DAYS)
      throw invalid(`Range is limited to ${MAX_RANGE_DAYS} days`);
    const where: Prisma.DiaryEntryWhereInput = {
      date: { gte: from, lte: to },
      ...(query.status && { status: query.status }),
      ...(query.branchId && { branchId: query.branchId }),
      AND: [await this.visible(scope, query.sectionId)],
    };
    const rows = await this.prisma.diaryEntry.findMany({
      where,
      include: DIARY_INCLUDE,
      orderBy: [{ date: 'desc' }, { createdAt: 'asc' }],
      take: 500,
    });
    return this.mapper.toDtos(rows);
  }

  async save(
    user: AuthUser,
    scope: Scope,
    dto: SaveDiaryDto,
  ): Promise<DiaryEntryDto> {
    const actor = await this.access.writer(
      user,
      scope,
      dto.sectionId,
      dto.subjectId,
    );
    const key = {
      userId: user.id,
      clientRequestId: dto.clientRequestId,
      action: 'diary.save',
    };
    const seen = await this.requests.seen(key);
    if (seen) return this.get(seen);
    const date = parseDate(dto.date);
    if (date > today()) throw invalid('Diary cannot be written ahead');
    await this.workingDays.assertWorkingDay(actor.section.branchId, date);
    for (const fileId of dto.attachmentFileIds ?? []) {
      await this.files.assertUsable(fileId, {
        schoolId: actor.section.schoolId,
        userId: user.id,
        purposes: ['ATTACHMENT', 'DOCUMENT'],
      });
    }
    const existing = await this.prisma.diaryEntry.findUnique({
      where: {
        sectionId_subjectId_date: {
          sectionId: dto.sectionId,
          subjectId: dto.subjectId,
          date,
        },
      },
    });
    if (existing) await this.assertEditable(existing, actor.helper);
    const content = {
      topics: dto.topics,
      homework: dto.homework ?? null,
      dueDate: dto.dueDate ? parseDate(dto.dueDate) : null,
      attachmentFileIds: dto.attachmentFileIds ?? [],
    };
    const id = await this.prisma.$transaction(async (tx) => {
      const row = existing
        ? await this.update(tx, existing, content, user.id, actor)
        : await tx.diaryEntry.create({
            data: {
              ...content,
              schoolId: actor.section.schoolId,
              branchId: actor.section.branchId,
              sessionId: actor.section.sessionId,
              sectionId: dto.sectionId,
              subjectId: dto.subjectId,
              date,
              authorId: user.id,
              onBehalfOfStaffId: actor.onBehalfOfStaffId,
            },
          });
      await this.requests.remember(tx, key, row.id);
      return row.id;
    });
    this.audit.stage({
      action: existing ? 'diary.update' : 'diary.create',
      entityType: 'DiaryEntry',
      entityId: id,
      schoolId: actor.section.schoolId,
      branchId: actor.section.branchId,
      onBehalfOfStaffId: actor.onBehalfOfStaffId ?? undefined,
      before: existing
        ? { topics: existing.topics, homework: existing.homework }
        : undefined,
      after: content,
    });
    return this.get(id);
  }

  async get(id: string): Promise<DiaryEntryDto> {
    const row = await this.prisma.diaryEntry.findUnique({
      where: { id },
      include: DIARY_INCLUDE,
    });
    if (!row) throw notFound('Diary entry');
    return this.mapper.toDto(row);
  }

  private async update(
    tx: Prisma.TransactionClient,
    existing: DiaryEntry,
    content: Pick<
      DiaryEntry,
      'topics' | 'homework' | 'dueDate' | 'attachmentFileIds'
    >,
    userId: string,
    actor: { onBehalfOfStaffId: string | null },
  ) {
    const published = existing.status === 'PUBLISHED';
    if (published) {
      await tx.diaryRevision.create({
        data: {
          entryId: existing.id,
          revision: existing.revision,
          topics: existing.topics,
          homework: existing.homework,
          dueDate: existing.dueDate,
          attachmentFileIds: existing.attachmentFileIds,
          editedById: userId,
        },
      });
    }
    return tx.diaryEntry.update({
      where: { id: existing.id },
      data: {
        ...content,
        status: published ? 'PUBLISHED' : 'DRAFT',
        revision: published ? { increment: 1 } : undefined,
        ...(actor.onBehalfOfStaffId && {
          onBehalfOfStaffId: actor.onBehalfOfStaffId,
        }),
      },
    });
  }

  private async assertEditable(entry: DiaryEntry, helper: boolean) {
    if (entry.status === 'SUBMITTED' || entry.status === 'PENDING_REVIEW')
      throw conflict('The entry is awaiting review');
    if (entry.status !== 'PUBLISHED') return;
    if (helper) throw forbidden('Helpers can only edit drafts');
    const closing = await this.settings.get<string>(
      entry.branchId,
      'diary.closingTime',
    );
    const sameDay = formatDate(entry.date) === formatDate(today());
    if (!sameDay || localTime() >= closing)
      throw recordLocked('The diary closed for this day');
  }

  private async visible(
    scope: Scope,
    sectionId?: string,
  ): Promise<Prisma.DiaryEntryWhereInput> {
    if (scope.guardian) {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { studentId: { in: [...scope.studentIds] }, status: 'ACTIVE' },
        select: { sectionId: true },
      });
      const sections = enrollments.map((e) => e.sectionId);
      if (sectionId && !sections.includes(sectionId)) throw notFound('Section');
      return {
        status: 'PUBLISHED',
        sectionId: sectionId ? sectionId : { in: sections },
      };
    }
    if (sectionId) {
      const section = await this.prisma.section.findUnique({
        where: { id: sectionId },
      });
      if (!section) throw notFound('Section');
      scope.assertReadSection(section, 'Section');
      return { sectionId };
    }
    return scope.sectionFilter();
  }
}
