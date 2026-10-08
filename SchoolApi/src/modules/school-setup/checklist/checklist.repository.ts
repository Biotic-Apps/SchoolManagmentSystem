import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import { activeAssignmentWhere } from '../../users/active-assignment-where';
import { ClassSetupService } from '../../academics/class-setup/class-setup.service';
import { TEACHING_DESIGNATIONS } from '../../staff/allocation/teaching-staff.service';
import type { ChecklistKey } from './checklist-keys';

export interface ChecklistBranch {
  id: string;
  schoolId: string;
}

const none = Promise.resolve(0);

export type ChecklistCounts = Record<ChecklistKey, number> & {
  /** Active sections of the session (allocation is done only when > 0). */
  sections: number;
};

/** Cheap counts behind GET /setup/checklist (contract §2). */
@Injectable()
export class ChecklistRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classSetup: ClassSetupService,
  ) {}

  findBranch(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
  }

  async counts(branch: ChecklistBranch): Promise<ChecklistCounts> {
    const session = await this.prisma.academicSession.findFirst({
      where: { branchId: branch.id, status: 'ACTIVE' },
      select: { id: true },
    });
    const sessionId = session?.id;
    const branchId = branch.id;
    const [
      classes,
      subjects,
      teachers,
      students,
      timetable,
      feePlan,
      bellSchedule,
      gaps,
    ] = await Promise.all([
      sessionId
        ? this.prisma.schoolClass.count({
            where: {
              status: 'ACTIVE',
              sections: { some: { sessionId, status: 'ACTIVE' } },
            },
          })
        : none,
      this.prisma.subject.count({
        where: { schoolId: branch.schoolId, status: 'ACTIVE' },
      }),
      this.teachers(branchId),
      sessionId
        ? this.prisma.enrollment.count({
            where: { branchId, sessionId, status: 'ACTIVE' },
          })
        : none,
      sessionId
        ? this.prisma.timetable.count({
            where: {
              branchId,
              sessionId,
              status: { in: ['PUBLISHED', 'DRAFT_REVISION'] },
            },
          })
        : none,
      sessionId
        ? this.prisma.feePlan.count({
            where: { branchId, sessionId, status: 'APPROVED' },
          })
        : none,
      this.prisma.branchPeriod.count({ where: { branchId } }),
      this.classSetup.allocationGaps(branch),
    ]);
    return {
      session: sessionId ? 1 : 0,
      classes,
      subjects,
      bellSchedule,
      teachers,
      allocation: gaps.unallocated,
      students,
      timetable,
      feePlan,
      sections: gaps.sections,
    };
  }

  /** Active staff of the branch whose login holds a TEACHER assignment there. */
  /** Teaching staff with or without a login (same rule as the teaching-staff list). */
  private teachers(branchId: string): Promise<number> {
    return this.prisma.staff.count({
      where: {
        branchId,
        status: 'ACTIVE',
        OR: [
          { designation: { in: TEACHING_DESIGNATIONS } },
          {
            user: {
              status: 'ACTIVE',
              roleAssignments: {
                some: {
                  AND: [
                    activeAssignmentWhere(),
                    { branchId, role: { key: RoleKey.TEACHER } },
                  ],
                },
              },
            },
          },
        ],
      },
    });
  }
}
