import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict, invalid } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { RosterService } from '../shared/roster.service';
import type { SaveSkillRatingsDto, SkillGridDto } from './dto/skill.dto';
import { SkillConfigService } from './skill-config.service';
import { completeCount, ratingProblems } from './skill-rules';
import { SkillSectionAccess } from './skill-section-access';

/** GET/PUT /exams/:id/skills: behaviour & skills grid of one section. */
@Injectable()
export class SkillRatingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: SkillSectionAccess,
    private readonly config: SkillConfigService,
    private readonly roster: RosterService,
    private readonly audit: AuditService,
  ) {}

  async grid(
    scope: Scope,
    examId: string,
    sectionId: string,
  ): Promise<SkillGridDto> {
    const { exam, section, editable } = await this.access.resolve(
      scope,
      examId,
      sectionId,
    );
    const [setup, students, rows] = await Promise.all([
      this.config.setup({ id: exam.branchId, schoolId: exam.schoolId }),
      this.roster.of(section.id),
      this.prisma.skillRating.findMany({
        where: { examId, sectionId: section.id },
        select: { studentId: true, itemId: true, value: true },
      }),
    ]);
    const ratings = new Map<string, Record<string, number>>(
      students.map((s) => [s.studentId, {}]),
    );
    for (const row of rows) {
      const entry = ratings.get(row.studentId);
      if (entry) entry[row.itemId] = row.value;
    }
    return {
      examId,
      sectionId: section.id,
      editable,
      items: setup.items,
      scale: setup.scale,
      students: students.map((s) => ({
        studentId: s.studentId,
        name: s.name,
        rollNo: s.rollNo,
        ratings: ratings.get(s.studentId) ?? {},
      })),
      complete: completeCount(
        ratings,
        setup.items.map((i) => i.id),
      ),
    };
  }

  async save(
    user: AuthUser,
    scope: Scope,
    examId: string,
    dto: SaveSkillRatingsDto,
  ): Promise<SkillGridDto> {
    const { exam, section, editable } = await this.access.resolve(
      scope,
      examId,
      dto.sectionId,
    );
    if (!editable)
      throw conflict('Results are published; ratings can no longer change');
    const [setup, students] = await Promise.all([
      this.config.setup({ id: exam.branchId, schoolId: exam.schoolId }),
      this.roster.of(section.id),
    ]);
    const problems = ratingProblems(
      dto.ratings,
      new Set(students.map((s) => s.studentId)),
      new Set(setup.items.map((i) => i.id)),
      setup.scale.length,
    );
    if (problems.length > 0) throw invalid('Invalid ratings', { problems });

    const base = {
      schoolId: exam.schoolId,
      branchId: exam.branchId,
      examId,
      sectionId: section.id,
    };
    await this.prisma.$transaction(
      async (tx) => {
        const cleared = dto.ratings.filter((r) => r.value === null);
        for (const r of cleared)
          await tx.skillRating.deleteMany({
            where: { examId, studentId: r.studentId, itemId: r.itemId },
          });
        for (const r of dto.ratings) {
          if (r.value === null) continue;
          await tx.skillRating.upsert({
            where: {
              examId_studentId_itemId: {
                examId,
                studentId: r.studentId,
                itemId: r.itemId,
              },
            },
            create: {
              ...base,
              studentId: r.studentId,
              itemId: r.itemId,
              value: r.value,
              updatedById: user.id,
            },
            update: {
              value: r.value,
              sectionId: section.id,
              updatedById: user.id,
            },
          });
        }
      },
      { timeout: 30_000 },
    );
    this.audit.stage({
      action: 'exam.skills_rate',
      entityType: 'Exam',
      entityId: examId,
      schoolId: exam.schoolId,
      branchId: exam.branchId,
      after: {
        sectionId: section.id,
        changed: dto.ratings.length,
        cleared: dto.ratings.filter((r) => r.value === null).length,
      },
    });
    return this.grid(scope, examId, section.id);
  }
}
