import { Injectable } from '@nestjs/common';
import type {
  EnrollmentStatus,
  Prisma,
  PromotionDecision,
} from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import { conflict } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { assertSessionOpen } from '../../academic-sessions/session-lock';
import { nextRollNo } from '../../students/enrollment/roll-number';
import { shiftDays } from '../progress/homework-summary';
import type {
  ApplyPromotionsDto,
  ApplyPromotionsResultDto,
  SkippedPromotionDto,
} from './dto/promotion.dto';
import { PromotionScope } from './promotion-scope';
import { resolveTargetSection } from './target-section';

const ENDED_AS: Record<string, EnrollmentStatus> = {
  PROMOTE: 'PROMOTED',
  CONDITIONAL: 'PROMOTED',
  REPEAT: 'REPEATED',
  GRADUATE: 'GRADUATED',
};

type Planned = { row: PromotionDecision; sectionId: string | null };

/**
 * POST /promotions/apply: CONFIRMED rows end the old enrollment the day
 * before effectiveDate and open an ACTIVE one in the new session.
 */
@Injectable()
export class PromotionApplyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scopes: PromotionScope,
    private readonly audit: AuditService,
  ) {}

  async apply(
    user: AuthUser,
    scope: Scope,
    dto: ApplyPromotionsDto,
  ): Promise<ApplyPromotionsResultDto> {
    const branch = await this.scopes.managedBranch(scope, dto.branchId);
    const rows = await this.prisma.promotionDecision.findMany({
      where: {
        branchId: branch.id,
        fromSessionId: dto.fromSessionId,
        status: 'CONFIRMED',
      },
    });
    if (rows.length === 0) throw conflict('No confirmed decisions to apply');
    const plan = await this.plan(rows);
    const effective = parseDate(dto.effectiveDate);
    const endDate = parseDate(shiftDays(dto.effectiveDate, -1));
    const skipped: SkippedPromotionDto[] = [];
    let applied = 0;
    for (const item of plan) {
      const reason = await this.prisma.$transaction((tx) =>
        this.applyOne(tx, item, effective, endDate, user.id),
      );
      if (reason)
        skipped.push({
          id: item.row.id,
          studentId: item.row.studentId,
          reason,
        });
      else applied++;
    }
    this.audit.stage({
      action: 'promotion.apply',
      entityType: 'AcademicSession',
      entityId: dto.fromSessionId,
      schoolId: branch.schoolId,
      branchId: branch.id,
      after: { effectiveDate: dto.effectiveDate, applied, skipped },
    });
    return { applied, skipped };
  }

  /** Resolves every target section first; any gap → 409 and nothing applied. */
  private async plan(rows: PromotionDecision[]): Promise<Planned[]> {
    const sessionIds = [...new Set(rows.map((r) => r.toSessionId))];
    const sessions = await this.prisma.academicSession.findMany({
      where: { id: { in: sessionIds } },
    });
    sessions.forEach(assertSessionOpen);
    const sections = await this.prisma.section.findMany({
      where: {
        OR: [
          { sessionId: { in: sessionIds }, status: 'ACTIVE' },
          { id: { in: rows.map((r) => r.fromSectionId) } },
        ],
      },
      select: { id: true, classId: true, name: true, sessionId: true },
    });
    const names = new Map(sections.map((s) => [s.id, s.name]));
    const problems: SkippedPromotionDto[] = [];
    const plan = rows.map((row): Planned => {
      if (row.decision === 'GRADUATE') return { row, sectionId: null };
      const target = row.toClassId
        ? resolveTargetSection(
            sections.filter((s) => s.sessionId === row.toSessionId),
            {
              classId: row.toClassId,
              toSectionId: row.toSectionId,
              fromSectionName: names.get(row.fromSectionId) ?? '',
            },
          )
        : null;
      if (!target)
        problems.push({
          id: row.id,
          studentId: row.studentId,
          reason: 'NO_TARGET_SECTION',
        });
      return { row, sectionId: target?.id ?? null };
    });
    if (problems.length > 0)
      throw conflict('Some students have no section in the new session', {
        decisions: problems,
      });
    return plan;
  }

  private async applyOne(
    tx: Prisma.TransactionClient,
    { row, sectionId }: Planned,
    effective: Date,
    endDate: Date,
    actorId: string,
  ): Promise<string | null> {
    const current = await tx.enrollment.findFirst({
      where: {
        studentId: row.studentId,
        sessionId: row.fromSessionId,
        status: 'ACTIVE',
      },
    });
    if (!current) return 'NO_ACTIVE_ENROLLMENT';
    if (effective <= current.startDate) return 'EFFECTIVE_BEFORE_START';
    await tx.enrollment.update({
      where: { id: current.id },
      data: {
        status: ENDED_AS[row.decision],
        endDate,
        reason: `Promotion: ${row.decision}`,
        updatedById: actorId,
      },
    });
    let newEnrollmentId: string | null = null;
    if (sectionId)
      newEnrollmentId = await this.enroll(
        tx,
        row,
        sectionId,
        effective,
        actorId,
      );
    else
      await tx.student.update({
        where: { id: row.studentId },
        data: { status: 'GRADUATED', updatedById: actorId },
      });
    await tx.promotionDecision.update({
      where: { id: row.id },
      data: {
        status: 'APPLIED',
        toSectionId: sectionId,
        effectiveDate: effective,
        appliedAt: new Date(),
        newEnrollmentId,
      },
    });
    this.audit.stage({
      action: 'promotion.apply_student',
      entityType: 'Student',
      entityId: row.studentId,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: { enrollmentId: current.id, sectionId: current.sectionId },
      after: { decision: row.decision, sectionId, newEnrollmentId },
    });
    return null;
  }

  private async enroll(
    tx: Prisma.TransactionClient,
    row: PromotionDecision,
    sectionId: string,
    startDate: Date,
    actorId: string,
  ): Promise<string> {
    await tx.$queryRaw`SELECT "id" FROM "sections" WHERE "id" = ${sectionId}::uuid FOR UPDATE`;
    const section = await tx.section.findUniqueOrThrow({
      where: { id: sectionId },
    });
    const taken = await tx.enrollment.findMany({
      where: { sectionId, status: 'ACTIVE' },
      select: { rollNo: true },
    });
    const created = await tx.enrollment.create({
      data: {
        schoolId: section.schoolId,
        studentId: row.studentId,
        branchId: section.branchId,
        sessionId: section.sessionId,
        sectionId,
        rollNo: nextRollNo(taken.map((t) => t.rollNo)),
        startDate,
        reason: `Promotion: ${row.decision}`,
        createdById: actorId,
      },
    });
    return created.id;
  }
}
