import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../../common/types/auth-user';
import type { ActiveAssignment } from '../access/active-assignment';
import { RoleKey } from '../role-key.enum';
import { Scope, subjectSectionKey } from './scope';

/** Roles whose data reach is limited to their assigned sections. */
const SECTION_LIMITED_ROLES = new Set<string>([
  RoleKey.TEACHER,
  RoleKey.HELPER,
]);

function add(set: Set<string>, value: string | null): void {
  if (value) set.add(value);
}

/** Turns the active role's assignments into allowed school/branch/section IDs. */
@Injectable()
export class ScopeService {
  static resolve(
    assignments: readonly ActiveAssignment[],
    studentIds: readonly string[] = [],
  ): Scope {
    if (assignments.some((a) => a.scopeType === 'GLOBAL')) {
      return Scope.createGlobal();
    }
    const sectionLimited =
      assignments.length > 0 &&
      assignments.every((a) => SECTION_LIMITED_ROLES.has(a.roleKey));
    const ids = {
      schoolIds: new Set<string>(),
      branchIds: new Set<string>(),
      sectionIds: new Set<string>(),
      memberSchoolIds: new Set<string>(),
      memberBranchIds: new Set<string>(),
      classSectionIds: new Set<string>(),
      subjectSectionKeys: new Set<string>(),
    };
    let guardian = false;
    for (const a of assignments) {
      add(ids.memberSchoolIds, a.schoolId);
      add(ids.memberBranchIds, a.branchId);
      switch (a.scopeType) {
        case 'SCHOOL':
          add(ids.schoolIds, a.schoolId);
          break;
        case 'BRANCH':
          if (!sectionLimited) add(ids.branchIds, a.branchId);
          break;
        case 'SECTION':
          add(ids.sectionIds, a.sectionId);
          add(ids.classSectionIds, a.sectionId);
          break;
        case 'SUBJECT_SECTION':
          add(ids.sectionIds, a.sectionId);
          if (a.sectionId && a.subjectId)
            ids.subjectSectionKeys.add(
              subjectSectionKey(a.sectionId, a.subjectId),
            );
          break;
        case 'GUARDIAN':
          guardian = true;
          break;
        default:
          break;
      }
    }
    return Scope.createLimited({
      ...ids,
      sectionLimited,
      guardian,
      studentIds: guardian ? studentIds : [],
    });
  }

  forUser(user: AuthUser): Scope {
    return ScopeService.resolve(user.assignments, user.studentIds);
  }
}
