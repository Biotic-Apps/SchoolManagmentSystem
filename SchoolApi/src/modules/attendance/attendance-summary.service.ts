import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { parseDate } from '../../core/common/dates';
import { notFound } from '../../core/common/errors/errors';
import { today } from '../../core/common/week';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type {
  SectionAttendanceDto,
  UnmarkedSectionDto,
} from './dto/register.dto';

const FINAL = new Set(['SUBMITTED', 'LOCKED']);

/** Per-section counts of a branch day; unmarked kept apart from absent. */
@Injectable()
export class AttendanceSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(
    scope: Scope,
    branchId: string,
    date?: string,
  ): Promise<SectionAttendanceDto[]> {
    const day = date ? parseDate(date) : today();
    const sections = await this.sections(scope, branchId);
    const registers = await this.prisma.attendanceRegister.findMany({
      where: { sectionId: { in: sections.map((s) => s.id) }, date: day },
      include: { entries: { select: { status: true } } },
    });
    const bySection = new Map(registers.map((r) => [r.sectionId, r]));
    return sections.map((section) => {
      const register = bySection.get(section.id);
      const count = (status: string) =>
        register?.entries.filter((e) => e.status === status).length ?? 0;
      return {
        sectionId: section.id,
        className: section.schoolClass.name,
        sectionName: section.name,
        status: register?.status ?? 'UNMARKED',
        present: count('PRESENT'),
        absent: count('ABSENT'),
        late: count('LATE'),
        leave: count('LEAVE'),
        halfDay: count('HALF_DAY'),
        total: section._count.enrollments,
      };
    });
  }

  async unmarked(
    scope: Scope,
    branchId: string,
    date?: string,
  ): Promise<UnmarkedSectionDto[]> {
    const rows = await this.summary(scope, branchId, date);
    const pending = rows.filter((r) => !FINAL.has(r.status));
    const teachers = await this.prisma.section.findMany({
      where: { id: { in: pending.map((r) => r.sectionId) } },
      select: { id: true, classTeacher: { select: { id: true, name: true } } },
    });
    const teacherOf = new Map(teachers.map((t) => [t.id, t.classTeacher]));
    return pending.map((r) => ({
      sectionId: r.sectionId,
      className: r.className,
      sectionName: r.sectionName,
      status: r.status,
      classTeacher: teacherOf.get(r.sectionId) ?? null,
    }));
  }

  private async sections(scope: Scope, branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch || scope.guardian) throw notFound('Branch');
    scope.assertReadBranch(branch);
    const where: Prisma.SectionWhereInput = {
      branchId,
      status: 'ACTIVE',
      session: { status: 'ACTIVE' },
      ...(scope.sectionLimited && { id: { in: [...scope.sectionIds] } }),
    };
    return this.prisma.section.findMany({
      where,
      orderBy: [{ schoolClass: { levelOrder: 'asc' } }, { name: 'asc' }],
      include: {
        schoolClass: { select: { name: true } },
        _count: { select: { enrollments: { where: { status: 'ACTIVE' } } } },
      },
    });
  }
}
