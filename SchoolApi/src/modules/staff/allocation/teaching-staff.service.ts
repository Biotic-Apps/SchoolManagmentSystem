import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { workingSlotWhere } from '../../academics/curriculum/working-slots';
import { activeAssignmentWhere } from '../../users/active-assignment-where';
import type { TeachingStaffDto } from './dto/allocation.dto';

export const TEACHING_DESIGNATIONS = ['TEACHER', 'HEAD_TEACHER', 'COORDINATOR'];
const TEACHING_KINDS = ['CLASS_TEACHER', 'SUBJECT_TEACHER'] as const;

/**
 * GET /branches/:id/teaching-staff: lesson/allocation candidates from staff
 * records (login or not), with their load (contract §5.3, D8). Read-only:
 * any member of the branch (class teachers building their own draft).
 */
@Injectable()
export class TeachingStaffService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    scope: Scope,
    branchId: string,
    sessionId?: string,
    all = false,
  ): Promise<TeachingStaffDto[]> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) throw notFound('Branch');
    scope.assertReadBranch(branch);
    const session =
      sessionId ??
      (
        await this.prisma.academicSession.findFirst({
          where: { branchId, status: 'ACTIVE' },
          select: { id: true },
        })
      )?.id;

    const staff = await this.prisma.staff.findMany({
      where: {
        branchId,
        status: 'ACTIVE',
        ...(all ? {} : { OR: this.candidateFilter(branchId, session) }),
      },
      select: { id: true, name: true, designation: true, userId: true },
      orderBy: { name: 'asc' },
    });
    const load = await this.load(
      staff.map((s) => s.id),
      session,
    );
    return staff.map((s) => ({
      id: s.id,
      name: s.name,
      designation: s.designation,
      hasLogin: s.userId !== null,
      allocatedPeriods: load.allocated.get(s.id) ?? 0,
      placedPeriods: load.placed.get(s.id) ?? 0,
      sections: load.sections.get(s.id)?.size ?? 0,
    }));
  }

  private candidateFilter(
    branchId: string,
    sessionId?: string,
  ): Prisma.StaffWhereInput[] {
    return [
      { designation: { in: TEACHING_DESIGNATIONS } },
      {
        assignments: {
          some: {
            endedAt: null,
            kind: { in: [...TEACHING_KINDS] },
            sessionId,
          },
        },
      },
      {
        user: {
          roleAssignments: {
            some: {
              AND: [
                activeAssignmentWhere(),
                { branchId, role: { key: RoleKey.PRINCIPAL } },
              ],
            },
          },
        },
      },
    ];
  }

  private async load(staffIds: string[], sessionId?: string) {
    const allocated = new Map<string, number>();
    const sections = new Map<string, Set<string>>();
    const placed = new Map<string, number>();
    if (!sessionId || staffIds.length === 0)
      return { allocated, sections, placed };

    const [assignments, slots] = await Promise.all([
      this.prisma.staffAssignment.findMany({
        where: {
          staffId: { in: staffIds },
          sessionId,
          endedAt: null,
          kind: { in: [...TEACHING_KINDS] },
        },
        select: {
          staffId: true,
          kind: true,
          sectionId: true,
          subjectId: true,
          section: { select: { classId: true } },
        },
      }),
      this.prisma.timetableSlot.groupBy({
        by: ['staffId'],
        where: {
          staffId: { in: staffIds },
          timetable: { sessionId },
          AND: [workingSlotWhere()],
        },
        _count: { _all: true },
      }),
    ]);
    const periods = await this.periodsPerWeek(assignments);
    for (const a of assignments) {
      if (a.sectionId) {
        if (!sections.has(a.staffId)) sections.set(a.staffId, new Set());
        sections.get(a.staffId)!.add(a.sectionId);
      }
      if (a.kind !== 'SUBJECT_TEACHER' || !a.section || !a.subjectId) continue;
      const ppw = periods.get(`${a.section.classId}:${a.subjectId}`) ?? 0;
      allocated.set(a.staffId, (allocated.get(a.staffId) ?? 0) + ppw);
    }
    for (const row of slots) placed.set(row.staffId, row._count._all);
    return { allocated, sections, placed };
  }

  /** `classId:subjectId` → periodsPerWeek of the class curriculum. */
  private async periodsPerWeek(
    assignments: {
      subjectId: string | null;
      section: { classId: string } | null;
    }[],
  ) {
    const classIds = [
      ...new Set(
        assignments.map((a) => a.section?.classId).filter((id) => !!id),
      ),
    ] as string[];
    const links = await this.prisma.classSubject.findMany({
      where: { classId: { in: classIds }, status: 'ACTIVE' },
      select: { classId: true, subjectId: true, periodsPerWeek: true },
    });
    return new Map(
      links.map((l) => [`${l.classId}:${l.subjectId}`, l.periodsPerWeek ?? 0]),
    );
  }
}
