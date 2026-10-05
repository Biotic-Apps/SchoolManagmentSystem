import type { ScopeType } from '../../../generated/prisma/client';

/** A role assignment as cached for request-time checks (dates as ISO). */
export interface ActiveAssignment {
  id: string;
  roleId: string;
  roleKey: string;
  roleName: string;
  scopeType: ScopeType;
  schoolId: string | null;
  schoolName: string | null;
  branchId: string | null;
  branchName: string | null;
  sectionId: string | null;
  subjectId: string | null;
  validFrom: string;
  validUntil: string | null;
}

export function isValidAt(assignment: ActiveAssignment, at: number): boolean {
  return (
    Date.parse(assignment.validFrom) <= at &&
    (assignment.validUntil === null || Date.parse(assignment.validUntil) > at)
  );
}
