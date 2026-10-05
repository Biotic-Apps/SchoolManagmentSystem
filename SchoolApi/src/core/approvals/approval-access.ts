import type { Scope } from '../rbac/scope/scope';

export interface StepApprover {
  approverUserId: string | null;
  approverRole: string | null;
}

export interface DeciderContext {
  userId: string;
  activeRole: string;
  scope: Scope;
}

export interface RequestRef {
  schoolId: string;
  branchId: string | null;
}

/** A step is decided by its named user, or else by the role within scope. */
export function canDecideStep(
  step: StepApprover,
  request: RequestRef,
  decider: DeciderContext,
): boolean {
  if (step.approverUserId) return step.approverUserId === decider.userId;
  if (step.approverRole !== decider.activeRole) return false;
  return request.branchId
    ? decider.scope.canReadBranch({
        id: request.branchId,
        schoolId: request.schoolId,
      })
    : decider.scope.canManageSchool(request.schoolId);
}
