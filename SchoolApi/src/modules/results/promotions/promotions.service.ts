import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { AsyncTaskService } from '../../tasks/async-task.service';
import type {
  PromotionQueryDto,
  PromotionRowDto,
  SuggestPromotionsDto,
  UpdatePromotionDto,
} from './dto/promotion.dto';
import { PROMOTION_SUGGEST_JOB } from './jobs/promotion-suggest.processor';
import type { SuggestInput } from './promotion-builder';
import { PromotionMapper } from './promotion.mapper';
import { PromotionScope } from './promotion-scope';
import { targetClassId } from './promotion-rules';
import { nextClass } from './target-section';

/** Suggest (job), list and override promotion decisions. */
@Injectable()
export class PromotionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scopes: PromotionScope,
    private readonly tasks: AsyncTaskService,
    private readonly mapper: PromotionMapper,
    private readonly audit: AuditService,
  ) {}

  async suggest(
    user: AuthUser,
    scope: Scope,
    dto: SuggestPromotionsDto,
  ): Promise<{ jobId: string }> {
    const branch = await this.scopes.managedBranch(scope, dto.branchId);
    if (dto.fromSessionId === dto.toSessionId)
      throw invalid('toSessionId must differ from fromSessionId');
    await this.scopes.assertSessions(branch.id, [
      dto.fromSessionId,
      dto.toSessionId,
    ]);
    const exams = await this.prisma.exam.findMany({
      where: { id: { in: dto.examIds } },
      select: { id: true, branchId: true, sessionId: true, status: true },
    });
    const wrong = dto.examIds.filter((id) => {
      const exam = exams.find((e) => e.id === id);
      return (
        !exam ||
        exam.branchId !== branch.id ||
        exam.sessionId !== dto.fromSessionId
      );
    });
    if (wrong.length > 0)
      throw invalid('Exams not found in this branch and session', {
        examIds: wrong,
      });
    const open = exams.filter(
      (e) => !['RESULTS_APPROVED', 'PUBLISHED'].includes(e.status),
    );
    if (open.length > 0)
      throw conflict('Results of these exams are not approved yet', {
        examIds: open.map((e) => e.id),
      });
    const jobId = await this.tasks.enqueue<SuggestInput>(user, {
      queue: QUEUES.REPORTS,
      name: PROMOTION_SUGGEST_JOB,
      data: { ...dto, examIds: [...new Set(dto.examIds)] },
      schoolId: branch.schoolId,
      branchId: branch.id,
    });
    return { jobId };
  }

  async list(
    scope: Scope,
    query: PromotionQueryDto,
  ): Promise<PromotionRowDto[]> {
    const branch = await this.scopes.readableBranch(scope, query.branchId);
    const where: Prisma.PromotionDecisionWhereInput = {
      branchId: branch.id,
      fromSessionId: query.fromSessionId,
      fromClassId: query.classId,
      decision: query.decision,
    };
    if (scope.guardian) where.studentId = { in: [...scope.studentIds] };
    else if (!scope.canManageBranch(branch))
      where.fromSectionId = { in: [...scope.sectionIds] };
    const rows = await this.prisma.promotionDecision.findMany({
      where,
      orderBy: [{ fromClassId: 'asc' }, { fromSectionId: 'asc' }],
      take: 2000,
    });
    return this.mapper.many(rows);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdatePromotionDto,
  ): Promise<PromotionRowDto> {
    const row = await this.prisma.promotionDecision.findUnique({
      where: { id },
    });
    if (!row) throw notFound('Promotion decision');
    await this.scopes.managedBranch(scope, row.branchId);
    if (row.status !== 'SUGGESTED' || row.approvalId)
      throw conflict(
        'Only suggested decisions not awaiting approval can change',
      );
    if (dto.decision !== row.suggested && !dto.reason?.trim())
      throw invalid('A reason is required to override the suggestion');
    const classes = await this.prisma.schoolClass.findMany({
      where: { schoolId: row.schoolId, status: 'ACTIVE' },
      select: { id: true, levelOrder: true },
    });
    const toClassId = targetClassId(
      dto.decision,
      row.fromClassId,
      nextClass(classes, row.fromClassId)?.id ?? null,
    );
    if (dto.decision !== 'GRADUATE' && !toClassId)
      throw invalid('There is no next class to promote to');
    if (dto.toSectionId) {
      if (!toClassId) throw invalid('Graduating students get no section');
      const section = await this.prisma.section.findUnique({
        where: { id: dto.toSectionId },
      });
      if (
        !section ||
        section.sessionId !== row.toSessionId ||
        section.classId !== toClassId
      )
        throw invalid(
          'The section is not in the target class of the new session',
        );
    }
    const updated = await this.prisma.promotionDecision.update({
      where: { id },
      data: {
        decision: dto.decision,
        toClassId,
        toSectionId: dto.toSectionId ?? null,
        reason: dto.reason?.trim() || null,
        overriddenById: user.id,
      },
    });
    this.audit.stage({
      action: 'promotion.override',
      entityType: 'PromotionDecision',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: { decision: row.decision, toSectionId: row.toSectionId },
      after: dto,
    });
    return (await this.mapper.many([updated]))[0];
  }
}
