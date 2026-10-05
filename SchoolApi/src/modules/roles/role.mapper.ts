import type { RoleDto } from './dto/role.dto';
import type { RoleWithPermissions } from './roles.repository';

export function toRoleDto(
  role: RoleWithPermissions,
  assignmentCount: number,
): RoleDto {
  return {
    id: role.id,
    key: role.key,
    name: role.name,
    isSystem: role.isSystem,
    schoolId: role.schoolId,
    permissions: role.permissions.map((p) => p.permissionKey).sort(),
    assignmentCount,
  };
}
