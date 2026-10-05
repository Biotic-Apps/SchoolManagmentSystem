import type { ActiveAssignment } from '../../core/rbac/access/active-assignment';
import { sortRoleKeys } from '../../core/rbac/role-priority';
import { toAssignmentDto } from './assignment.mapper';
import type { UserDetailDto, UserSummaryDto } from './dto/user.dto';
import type { UserRow } from './users.repository';

function assignmentsOf(row: UserRow): ActiveAssignment[] {
  return row.roleAssignments.map((a) => ({
    id: a.id,
    roleId: a.roleId,
    roleKey: a.role.key,
    roleName: a.role.name,
    scopeType: a.scopeType,
    schoolId: a.schoolId,
    schoolName: a.school?.name ?? null,
    branchId: a.branchId,
    branchName: a.branch?.name ?? null,
    sectionId: a.sectionId,
    subjectId: a.subjectId,
    validFrom: a.validFrom.toISOString(),
    validUntil: a.validUntil?.toISOString() ?? null,
  }));
}

export function toUserSummary(row: UserRow): UserSummaryDto {
  const branchNames = row.roleAssignments
    .map((a) => a.branch?.name)
    .filter((n): n is string => !!n);
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    roles: sortRoleKeys(row.roleAssignments.map((a) => a.role.key)),
    branchNames: [...new Set(branchNames)].sort(),
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
  };
}

export function toUserDetail(row: UserRow): UserDetailDto {
  return {
    ...toUserSummary(row),
    assignments: assignmentsOf(row).map(toAssignmentDto),
    mustChangePassword: row.mustChangePassword,
    createdAt: row.createdAt.toISOString(),
  };
}
