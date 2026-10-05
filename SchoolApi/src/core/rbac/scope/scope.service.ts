import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../../common/types/auth-user';
import type { ActiveAssignment } from '../access/active-assignment';
import { Scope } from './scope';

function add(set: Set<string>, value: string | null): void {
  if (value) set.add(value);
}

/** Turns the active role's assignments into allowed school/branch/section IDs. */
@Injectable()
export class ScopeService {
  static resolve(assignments: readonly ActiveAssignment[]): Scope {
    if (assignments.some((a) => a.scopeType === 'GLOBAL')) {
      return Scope.createGlobal();
    }
    const ids = {
      schoolIds: new Set<string>(),
      branchIds: new Set<string>(),
      sectionIds: new Set<string>(),
      memberSchoolIds: new Set<string>(),
      memberBranchIds: new Set<string>(),
    };
    for (const a of assignments) {
      add(ids.memberSchoolIds, a.schoolId);
      add(ids.memberBranchIds, a.branchId);
      switch (a.scopeType) {
        case 'SCHOOL':
          add(ids.schoolIds, a.schoolId);
          break;
        case 'BRANCH':
          add(ids.branchIds, a.branchId);
          break;
        case 'SECTION':
        case 'SUBJECT_SECTION':
          add(ids.sectionIds, a.sectionId);
          break;
        default:
          break;
      }
    }
    return Scope.createLimited(ids);
  }

  forUser(user: AuthUser): Scope {
    return ScopeService.resolve(user.assignments);
  }
}
