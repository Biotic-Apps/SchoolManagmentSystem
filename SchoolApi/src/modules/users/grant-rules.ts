import type { ScopeType } from '../../generated/prisma/client';
import {
  forbidden,
  forbiddenScope,
  invalid,
} from '../../core/common/errors/errors';
import { RoleKey } from '../../core/rbac/role-key.enum';
import type { Scope } from '../../core/rbac/scope/scope';

export interface GrantActor {
  userId: string;
  isSuperAdmin: boolean;
  scope: Scope;
}

export interface GrantTarget {
  targetUserId: string;
  roleKey: string;
  /** School of a custom role; null for system/global roles. */
  roleSchoolId: string | null;
  scopeType: ScopeType;
  schoolId: string | null;
  branchId: string | null;
}

const RESTRICTED_ROLES = new Set<string>([
  RoleKey.SUPER_ADMIN,
  RoleKey.PRINCIPAL,
]);

/**
 * contract §6: only SUPER_ADMIN grants SUPER_ADMIN/PRINCIPAL; principals grant
 * only inside their branches; nobody edits their own assignments.
 */
export function assertCanGrant(actor: GrantActor, target: GrantTarget): void {
  if (actor.userId === target.targetUserId) {
    throw forbidden('You cannot change your own role assignments');
  }
  if (
    (target.roleKey === String(RoleKey.SUPER_ADMIN)) !==
    (target.scopeType === 'GLOBAL')
  ) {
    throw invalid(
      'SUPER_ADMIN must use GLOBAL scope, and only SUPER_ADMIN may',
    );
  }
  if (target.roleSchoolId && target.schoolId !== target.roleSchoolId) {
    throw invalid('This custom role belongs to another school');
  }
  if (actor.isSuperAdmin) return;

  if (RESTRICTED_ROLES.has(target.roleKey)) {
    throw forbidden('Only Super Admin can grant this role');
  }
  if (target.scopeType === 'SCHOOL' || !target.branchId || !target.schoolId) {
    throw forbidden('You can only grant roles inside a branch');
  }
  if (
    !actor.scope.canManageBranch({
      id: target.branchId,
      schoolId: target.schoolId,
    })
  ) {
    throw forbiddenScope('Branch is outside your scope');
  }
}
