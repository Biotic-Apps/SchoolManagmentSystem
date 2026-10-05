import { describePermission } from '../../src/core/rbac/permission-description';
import { PERMISSION_CATALOGUE } from '../../src/core/rbac/permission-catalogue';
import type { SeedClient } from './client';

/** Mirrors the code catalogue into `permissions`, removing retired keys. */
export async function seedPermissions(prisma: SeedClient): Promise<void> {
  const keys = [...PERMISSION_CATALOGUE];
  for (const key of keys) {
    const info = describePermission(key);
    await prisma.permission.upsert({
      where: { key },
      create: info,
      update: { module: info.module, action: info.action, description: info.description },
    });
  }
  await prisma.rolePermission.deleteMany({ where: { permissionKey: { notIn: keys } } });
  await prisma.permission.deleteMany({ where: { key: { notIn: keys } } });
}
