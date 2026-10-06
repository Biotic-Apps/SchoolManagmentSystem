import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { today } from '../../../core/common/week';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { CoverageQueryDto, CoverageRowDto } from '../dto/syllabus.dto';
import { summarize } from '../progress-summary';

@Injectable()
export class CoverageService {
  constructor(private readonly prisma: PrismaService) {}

  async coverage(
    scope: Scope,
    query: CoverageQueryDto,
  ): Promise<CoverageRowDto[]> {
    const visible: Prisma.SyllabusPlanWhereInput = scope.guardian
      ? { sectionId: { in: await this.childSections(scope) } }
      : scope.sectionFilter();
    const plans = await this.prisma.syllabusPlan.findMany({
      where: {
        AND: [
          visible,
          {
            status: 'APPROVED',
            branchId: query.branchId,
            sessionId: query.sessionId,
            section: query.classId ? { classId: query.classId } : undefined,
          },
        ],
      },
      include: {
        subject: { select: { name: true } },
        section: {
          select: {
            name: true,
            schoolClass: { select: { name: true, levelOrder: true } },
          },
        },
        topics: { select: { status: true, targetDate: true } },
      },
      take: 1000,
    });
    const now = today();
    return plans
      .map((p) => ({
        sectionId: p.sectionId,
        sectionName: p.section.name,
        className: p.section.schoolClass.name,
        subjectId: p.subjectId,
        subjectName: p.subject.name,
        ...summarize(p.topics, now),
      }))
      .sort(
        (a, b) =>
          a.className.localeCompare(b.className) ||
          a.sectionName.localeCompare(b.sectionName) ||
          a.subjectName.localeCompare(b.subjectName),
      );
  }

  private async childSections(scope: Scope): Promise<string[]> {
    const rows = await this.prisma.enrollment.findMany({
      where: { studentId: { in: [...scope.studentIds] }, status: 'ACTIVE' },
      select: { sectionId: true },
    });
    return rows.map((r) => r.sectionId);
  }
}
