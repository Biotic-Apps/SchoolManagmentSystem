import type { AuthUser } from '../../core/common/types/auth-user';
import { isPrincipal, isSuperAdmin } from '../../core/rbac/actor';
import type { Scope } from '../../core/rbac/scope/scope';

export interface ComplaintRef {
  schoolId: string;
  branchId: string | null;
  complainantId: string;
  assigneeId: string | null;
  againstUserId: string | null;
}

/** Branch-wide handling: management scope (principal, coordinator, super admin). */
export function canManageComplaint(scope: Scope, ref: ComplaintRef): boolean {
  if (scope.guardian || scope.sectionLimited) return false;
  return ref.branchId
    ? scope.canManageBranch({ id: ref.branchId, schoolId: ref.schoolId })
    : scope.canManageSchool(ref.schoolId);
}

export const isLeader = (user: AuthUser): boolean =>
  isPrincipal(user) || isSuperAdmin(user);

export function canViewComplaint(
  user: AuthUser,
  scope: Scope,
  ref: ComplaintRef,
): boolean {
  if (ref.againstUserId === user.id) return false;
  if (ref.complainantId === user.id || ref.assigneeId === user.id) return true;
  return canManageComplaint(scope, ref);
}

/** Prisma filter hiding complaints filed against the caller. */
export const notAgainst = (userId: string) => ({
  OR: [{ againstUserId: null }, { againstUserId: { not: userId } }],
});
