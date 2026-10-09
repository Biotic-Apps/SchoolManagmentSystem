import { forbidden } from '../../../core/common/errors/errors';
import type { BranchRef, Scope } from '../../../core/rbac/scope/scope';
import type { UpdateBranchDto } from '../dto/update-branch.dto';

/** Fields only school administrators may change; the identity of a branch. */
const ADMIN_ONLY_FIELDS = ['name', 'code'] as const;

/**
 * School managers edit everything. A branch-scoped manager (the principal)
 * edits only their own branch's timings, working days and contacts.
 */
export function assertCanEditBranch(
  scope: Scope,
  branch: BranchRef,
  dto: UpdateBranchDto,
): void {
  scope.assertManageBranch(branch);
  if (scope.canManageSchool(branch.schoolId)) return;
  if (ADMIN_ONLY_FIELDS.some((field) => dto[field] !== undefined)) {
    throw forbidden(
      'Only school administrators can change branch name or code',
    );
  }
}
