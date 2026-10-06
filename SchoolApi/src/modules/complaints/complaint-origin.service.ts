import { Injectable } from '@nestjs/common';
import { invalid } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import type { Scope } from '../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../school-day/school-people.service';
import { StudentPlacementService } from '../school-day/student-placement.service';

export interface ComplaintOrigin {
  schoolId: string;
  branchId: string | null;
}

/** School and branch of a complaint filed without a student. */
@Injectable()
export class ComplaintOriginService {
  constructor(
    private readonly people: SchoolPeopleService,
    private readonly placements: StudentPlacementService,
  ) {}

  async resolve(user: AuthUser, scope: Scope): Promise<ComplaintOrigin> {
    const staff = await this.people.staffOfUser(user.id);
    if (staff) return { schoolId: staff.schoolId, branchId: staff.branchId };
    for (const studentId of scope.studentIds) {
      const placement = await this.placements.find(studentId);
      if (placement) {
        return { schoolId: placement.schoolId, branchId: placement.branchId };
      }
    }
    const withBranch = user.assignments.find((a) => a.branchId && a.schoolId);
    if (withBranch?.schoolId) {
      return { schoolId: withBranch.schoolId, branchId: withBranch.branchId };
    }
    const schoolId =
      user.assignments.find((a) => a.schoolId)?.schoolId ??
      [...scope.memberSchoolIds][0];
    if (!schoolId) throw invalid('Cannot determine your school');
    return { schoolId, branchId: null };
  }
}
