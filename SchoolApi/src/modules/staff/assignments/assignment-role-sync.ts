import type {
  Prisma,
  ScopeType,
  StaffAssignmentKind,
} from '../../../generated/prisma/client';
import { invalid } from '../../../core/common/errors/errors';
import { RoleKey } from '../../../core/rbac/role-key.enum';

export interface RoleGrant {
  roleKey: RoleKey;
  scopeType: ScopeType;
}

/** contract §5: assignments drive SECTION / SUBJECT_SECTION / BRANCH role scopes. */
export function roleGrantFor(
  kind: StaffAssignmentKind,
  hasSection: boolean,
): RoleGrant {
  switch (kind) {
    case 'CLASS_TEACHER':
      return { roleKey: RoleKey.TEACHER, scopeType: 'SECTION' };
    case 'SUBJECT_TEACHER':
      return { roleKey: RoleKey.TEACHER, scopeType: 'SUBJECT_SECTION' };
    case 'HELPER':
      return { roleKey: RoleKey.HELPER, scopeType: 'SECTION' };
    case 'COORDINATOR':
      return {
        roleKey: RoleKey.COORDINATOR,
        scopeType: hasSection ? 'SECTION' : 'BRANCH',
      };
    case 'HEAD_TEACHER':
      return {
        roleKey: RoleKey.HEAD_TEACHER,
        scopeType: hasSection ? 'SECTION' : 'BRANCH',
      };
  }
}

export interface SyncInput {
  userId: string;
  kind: StaffAssignmentKind;
  schoolId: string;
  branchId: string;
  sectionId: string | null;
  subjectId: string | null;
  validUntil: Date | null;
  grantedById: string;
}

/** Creates the role assignment that mirrors a staff assignment. */
export async function createRoleAssignment(
  tx: Prisma.TransactionClient,
  input: SyncInput,
): Promise<string> {
  const grant = roleGrantFor(input.kind, input.sectionId !== null);
  const role = await tx.role.findFirst({
    where: { key: grant.roleKey, schoolId: null, status: 'ACTIVE' },
  });
  if (!role) throw invalid(`System role ${grant.roleKey} is missing`);
  const created = await tx.roleAssignment.create({
    data: {
      userId: input.userId,
      roleId: role.id,
      scopeType: grant.scopeType,
      schoolId: input.schoolId,
      branchId: input.branchId,
      sectionId: grant.scopeType === 'BRANCH' ? null : input.sectionId,
      subjectId: grant.scopeType === 'SUBJECT_SECTION' ? input.subjectId : null,
      validUntil: input.validUntil,
      grantedById: input.grantedById,
    },
  });
  return created.id;
}
