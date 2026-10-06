import { Injectable } from '@nestjs/common';
import type { Prisma, TopicStatus } from '../../../generated/prisma/client';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import {
  conflict,
  forbiddenScope,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { today } from '../../../core/common/week';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SectionAccessService } from '../../students/section-access.service';
import type {
  PlanDraftDto,
  PlanQueryDto,
  SyllabusPlanDto,
} from '../dto/syllabus.dto';
import { PLAN_INCLUDE, toPlanDto, type PlanRow } from './plan.mapper';

type Carried = {
  status: TopicStatus;
  completedOn: Date | null;
  note: string | null;
};

/** Progress survives a re-plan when chapter and topic titles still match. */
export function carryKey(chapter: string, topic: string): string {
  return `${chapter.trim().toLowerCase()}|${topic.trim().toLowerCase()}`;
}

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SectionAccessService,
    private readonly approvals: ApprovalService,
    private readonly audit: AuditService,
  ) {}

  async list(scope: Scope, query: PlanQueryDto): Promise<SyllabusPlanDto[]> {
    let where: Prisma.SyllabusPlanWhereInput;
    if (query.sectionId) {
      await this.sections.read(scope, query.sectionId);
      where = { sectionId: query.sectionId };
    } else if (scope.guardian) {
      const sections = await this.prisma.enrollment.findMany({
        where: { studentId: { in: [...scope.studentIds] }, status: 'ACTIVE' },
        select: { sectionId: true },
      });
      where = { sectionId: { in: sections.map((s) => s.sectionId) } };
    } else {
      where = scope.sectionFilter();
    }
    const rows = await this.prisma.syllabusPlan.findMany({
      where: {
        AND: [
          where,
          { subjectId: query.subjectId, sessionId: query.sessionId },
          scope.guardian ? { status: 'APPROVED' } : {},
        ],
      },
      include: PLAN_INCLUDE,
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    const now = today();
    return rows.map((row) => toPlanDto(row, now));
  }

  async saveDraft(
    user: AuthUser,
    scope: Scope,
    dto: PlanDraftDto,
  ): Promise<SyllabusPlanDto> {
    const section = await this.sections.read(scope, dto.sectionId);
    if (section.sessionId !== dto.sessionId)
      throw invalid('sessionId does not match the section');
    const manager = scope.canManageBranch({
      id: section.branchId,
      schoolId: section.schoolId,
    });
    if (!manager && !scope.canTeach(section.id, dto.subjectId))
      throw forbiddenScope();
    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
    });
    if (!subject || subject.schoolId !== section.schoolId)
      throw invalid('Subject not found');

    const id = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.syllabusPlan.findUnique({
        where: {
          sectionId_subjectId_sessionId: {
            sectionId: section.id,
            subjectId: dto.subjectId,
            sessionId: dto.sessionId,
          },
        },
        include: PLAN_INCLUDE,
      });
      if (existing?.status === 'SUBMITTED')
        throw conflict('The plan is awaiting approval');
      const carried = this.progressOf(existing);
      const plan = existing
        ? await tx.syllabusPlan.update({
            where: { id: existing.id },
            data: {
              status: 'DRAFT',
              revision:
                existing.status === 'APPROVED'
                  ? existing.revision + 1
                  : existing.revision,
              approvalRequestId: null,
              updatedById: user.id,
            },
          })
        : await tx.syllabusPlan.create({
            data: {
              schoolId: section.schoolId,
              branchId: section.branchId,
              sessionId: dto.sessionId,
              sectionId: section.id,
              subjectId: dto.subjectId,
              createdById: user.id,
            },
          });
      await tx.syllabusChapter.deleteMany({ where: { planId: plan.id } });
      for (const chapter of dto.chapters) {
        const created = await tx.syllabusChapter.create({
          data: {
            planId: plan.id,
            title: chapter.title.trim(),
            order: chapter.order,
          },
        });
        await tx.syllabusTopic.createMany({
          data: chapter.topics.map((topic) => ({
            planId: plan.id,
            chapterId: created.id,
            title: topic.title.trim(),
            order: topic.order,
            targetDate: parseDate(topic.targetDate),
            ...carried.get(carryKey(chapter.title, topic.title)),
          })),
        });
      }
      return plan.id;
    });
    return this.done(user, 'syllabus_plan.draft', id);
  }

  async submit(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<SyllabusPlanDto> {
    const plan = await this.load(scope, id);
    if (plan.status !== 'DRAFT' && plan.status !== 'RETURNED')
      throw conflict(`Plan is ${plan.status}`);
    if (plan.chapters.every((c) => c.topics.length === 0))
      throw invalid('Plan has no topics');
    await this.prisma.$transaction(async (tx) => {
      const approval = await this.approvals.create(
        {
          type: 'SYLLABUS_PLAN',
          entityType: 'SyllabusPlan',
          entityId: plan.id,
          schoolId: plan.schoolId,
          branchId: plan.branchId,
          requestedById: user.id,
          title: `Syllabus plan: ${plan.subject.name} (rev ${plan.revision})`,
          payload: { planId: plan.id, revision: plan.revision },
          steps: [{ approverRole: RoleKey.PRINCIPAL }],
        },
        tx,
      );
      await tx.syllabusPlan.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          approvalRequestId: approval.id,
          submittedById: user.id,
          comment: null,
        },
      });
    });
    return this.done(user, 'syllabus_plan.submit', id);
  }

  /** Decides the SYLLABUS_PLAN approval; the handler applies the outcome. */
  async decide(
    user: AuthUser,
    scope: Scope,
    id: string,
    decision: 'APPROVED' | 'RETURNED',
    comment?: string,
  ): Promise<SyllabusPlanDto> {
    const plan = await this.load(scope, id);
    if (plan.status !== 'SUBMITTED' || !plan.approvalRequestId)
      throw conflict('Plan is not awaiting approval');
    await this.approvals.decide(user, scope, plan.approvalRequestId, {
      decision,
      comment,
    });
    const row = await this.prisma.syllabusPlan.findUniqueOrThrow({
      where: { id },
      include: PLAN_INCLUDE,
    });
    return toPlanDto(row, today());
  }

  private async load(scope: Scope, id: string): Promise<PlanRow> {
    const plan = await this.prisma.syllabusPlan.findUnique({
      where: { id },
      include: PLAN_INCLUDE,
    });
    if (!plan) throw notFound('Syllabus plan');
    await this.sections.read(scope, plan.sectionId);
    return plan;
  }

  private progressOf(plan: PlanRow | null): Map<string, Carried> {
    const map = new Map<string, Carried>();
    for (const chapter of plan?.chapters ?? []) {
      for (const t of chapter.topics) {
        map.set(carryKey(chapter.title, t.title), {
          status: t.status,
          completedOn: t.completedOn,
          note: t.note,
        });
      }
    }
    return map;
  }

  private async done(
    user: AuthUser,
    action: string,
    id: string,
  ): Promise<SyllabusPlanDto> {
    const row = await this.prisma.syllabusPlan.findUniqueOrThrow({
      where: { id },
      include: PLAN_INCLUDE,
    });
    const dto = toPlanDto(row, today());
    this.audit.stage({
      action,
      entityType: 'SyllabusPlan',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: {
        status: dto.status,
        revision: dto.revision,
        topics: dto.progress.total,
      },
    });
    return dto;
  }
}
