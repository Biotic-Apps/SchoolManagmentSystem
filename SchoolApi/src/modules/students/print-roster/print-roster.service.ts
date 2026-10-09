import { Injectable } from '@nestjs/common';
import {
  conflict,
  forbiddenScope,
  notFound,
} from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';

/** One section, or `branchId` (+ optional `classId`) for every current section. */
export interface RosterTarget {
  sectionId?: string;
  branchId?: string;
  classId?: string;
}

export interface RosterSection {
  id: string;
  name: string;
  schoolId: string;
  branchId: string;
  schoolClass: { name: string; levelOrder: number };
}

export interface PrintRoster {
  sections: RosterSection[];
  /** Current students in section order, then roll number. */
  studentIds: string[];
  /** "Class 5 A", "Class 5" or "branch" (file names, labels). */
  label: string;
}

const SECTION_SELECT = {
  id: true,
  name: true,
  schoolId: true,
  branchId: true,
  schoolClass: { select: { name: true, levelOrder: true } },
} as const;

export const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Who a bulk print (ID cards, login slips) covers, checked against the caller's scope. */
@Injectable()
export class PrintRosterService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(
    scope: Scope,
    target: RosterTarget,
    max: number,
  ): Promise<PrintRoster> {
    if (scope.guardian) throw notFound('Section');
    const sections = await this.sections(scope, target);
    const studentIds = await this.students(sections, max);
    const first = sections[0];
    const label =
      sections.length === 1
        ? `${first.schoolClass.name} ${first.name}`
        : target.classId
          ? first.schoolClass.name
          : 'branch';
    return { sections, studentIds, label };
  }

  private async students(
    sections: RosterSection[],
    max: number,
  ): Promise<string[]> {
    const rows = await this.prisma.enrollment.findMany({
      where: { sectionId: { in: sections.map((s) => s.id) }, status: 'ACTIVE' },
      select: {
        studentId: true,
        sectionId: true,
        rollNo: true,
        student: { select: { firstName: true } },
      },
    });
    if (rows.length === 0)
      throw conflict('No current students in these sections');
    if (rows.length > max)
      throw conflict(
        `Print at most ${max} students at once; choose a class or section`,
      );
    const order = new Map(sections.map((s, i) => [s.id, i]));
    rows.sort(
      (a, b) =>
        (order.get(a.sectionId) ?? 0) - (order.get(b.sectionId) ?? 0) ||
        (a.rollNo ?? 1e9) - (b.rollNo ?? 1e9) ||
        a.student.firstName.localeCompare(b.student.firstName),
    );
    return rows.map((r) => r.studentId);
  }

  private async sections(
    scope: Scope,
    target: RosterTarget,
  ): Promise<RosterSection[]> {
    if (target.sectionId) {
      const section = await this.prisma.section.findUnique({
        where: { id: target.sectionId },
        select: SECTION_SELECT,
      });
      if (!section) throw notFound('Section');
      if (!scope.canReadSection(section)) throw forbiddenScope();
      return [section];
    }
    const rows = await this.prisma.section.findMany({
      where: {
        branchId: target.branchId,
        classId: target.classId,
        status: 'ACTIVE',
        session: { status: 'ACTIVE' },
      },
      select: SECTION_SELECT,
      orderBy: [{ schoolClass: { levelOrder: 'asc' } }, { name: 'asc' }],
    });
    const readable = rows.filter((s) => scope.canReadSection(s));
    if (readable.length === 0)
      throw rows.length === 0 ? notFound('Section') : forbiddenScope();
    return readable;
  }
}
