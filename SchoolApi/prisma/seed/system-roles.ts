import {
  DEFAULT_ROLE_PERMISSIONS,
  SYSTEM_ROLE_NAMES,
} from '../../src/core/rbac/default-role-permissions';
import { RoleKey } from '../../src/core/rbac/role-key.enum';
import type { SeedClient } from './client';

export type SystemRoleIds = Record<RoleKey, string>;

/** Creates system roles; default permissions on creation or when `reset`. */
export async function seedSystemRoles(prisma: SeedClient, reset: boolean): Promise<SystemRoleIds> {
  const ids = {} as SystemRoleIds;
  for (const key of Object.values(RoleKey)) {
    const existing = await prisma.role.findFirst({ where: { key, schoolId: null } });
    const role =
      existing ??
      (await prisma.role.create({ data: { key, name: SYSTEM_ROLE_NAMES[key], isSystem: true } }));
    ids[key] = role.id;
    if (existing && !reset && key !== RoleKey.SUPER_ADMIN) continue;

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId: role.id } }),
      prisma.rolePermission.createMany({
        data: DEFAULT_ROLE_PERMISSIONS[key].map((permissionKey) => ({ roleId: role.id, permissionKey })),
      }),
    ]);
  }
  return ids;
}
