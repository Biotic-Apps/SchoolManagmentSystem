import type { Scope } from '../../../core/rbac/scope/scope';
import type { SchoolPeopleService } from '../../school-day/school-people.service';

export interface StudentScopeWhere {
  studentId?: { in: string[] };
  OR?: (
    | { schoolId: { in: string[] } }
    | { branchId: { in: string[] } }
    | { studentId: { in: string[] } }
  )[];
}

/** Departure rows the caller may read (the table has no sectionId column). */
export async function studentScopeWhere(
  scope: Scope,
  people: SchoolPeopleService,
): Promise<StudentScopeWhere> {
  if (scope.global) return {};
  if (scope.guardian) return { studentId: { in: [...scope.studentIds] } };
  const sectionStudents =
    scope.sectionIds.size > 0
      ? await people.activeStudentIds([...scope.sectionIds])
      : [];
  return {
    OR: [
      { schoolId: { in: [...scope.schoolIds] } },
      { branchId: { in: [...scope.branchIds] } },
      { studentId: { in: sectionStudents } },
    ],
  };
}
