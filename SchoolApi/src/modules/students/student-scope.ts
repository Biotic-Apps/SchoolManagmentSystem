import type { Prisma } from '../../generated/prisma/client';
import type { Scope } from '../../core/rbac/scope/scope';

export interface EnrollmentRef {
  schoolId: string;
  branchId: string;
  sectionId: string;
  status: string;
}

/**
 * Students reachable by the scope: managed branches see their whole history,
 * section assignments see the section's current students, parents see
 * verified children only.
 */
export function studentScopeWhere(scope: Scope): Prisma.StudentWhereInput {
  if (scope.global) return {};
  if (scope.guardian) return { id: { in: [...scope.studentIds] } };
  const access = scope.sectionAccess();
  return {
    enrollments: {
      some: {
        OR: [
          { schoolId: { in: access.schoolIds } },
          { branchId: { in: access.branchIds } },
          { status: 'ACTIVE', sectionId: { in: access.sectionIds } },
        ],
      },
    },
  };
}

export function canReadStudent(
  scope: Scope,
  studentId: string,
  enrollments: readonly EnrollmentRef[],
): boolean {
  if (scope.global) return true;
  if (scope.guardian) return scope.canAccessStudent(studentId);
  return enrollments.some(
    (e) =>
      scope.canManageBranch({ id: e.branchId, schoolId: e.schoolId }) ||
      (e.status === 'ACTIVE' && scope.sectionIds.has(e.sectionId)),
  );
}

/** Current = the ACTIVE enrollment, else the most recent one (rows sorted desc). */
export function currentEnrollment<T extends { status: string }>(
  rows: readonly T[],
): T | null {
  return rows.find((row) => row.status === 'ACTIVE') ?? rows[0] ?? null;
}
