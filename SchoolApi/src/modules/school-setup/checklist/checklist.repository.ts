import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import { activeAssignmentWhere } from '../../users/active-assignment-where';
import type { ChecklistKey } from './checklist-keys';

export interface ChecklistBranch {
  id: string;
  schoolId: string;
}

const none = Promise.resolve(0);

/** Cheap counts behind GET /setup/checklist (contract §2). */
@Injectable()
export class ChecklistRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBranch(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
  }

  async counts(branch: ChecklistBranch): Promise<Record<ChecklistKey, number>> {
    const session = await this.prisma.academicSession.findFirst({
      where: { branchId: branch.id, status: 'ACTIVE' },
      select: { id: true },
    });
    const sessionId = session?.id;
    const branchId = branch.id;
    const [classes, subjects, teachers, students, timetable, feePlan] =
      await Promise.all([
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
      ]);
    return {
      session: sessionId ? 1 : 0,
      classes,
      subjects,
      teachers,
      students,
      timetable,
      feePlan,
    };
  }

  /** Active staff of the branch whose login holds a TEACHER assignment there. */
  private teachers(branchId: string): Promise<number> {
    return this.prisma.staff.count({
      where: {
        branchId,
        status: 'ACTIVE',
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
    });
  }
}
