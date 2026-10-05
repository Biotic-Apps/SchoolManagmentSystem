import { RoleKey } from '../../src/core/rbac/role-key.enum';
import type { SeedClient } from './client';
import { seedAcademics } from './demo-academics';
import { seedOrganisation } from './demo-org';
import type { SystemRoleIds } from './system-roles';
import { ensureAssignment, ensureUser } from './users';

const PASSWORD = 'Demo@1234';

const BRANCH_STAFF = [
  ['principal@eschool.local', 'Demo Principal', RoleKey.PRINCIPAL],
  ['coordinator@eschool.local', 'Demo Coordinator', RoleKey.COORDINATOR],
  ['teacher@eschool.local', 'Demo Teacher', RoleKey.TEACHER],
  ['accountant@eschool.local', 'Demo Accountant', RoleKey.ACCOUNTANT],
] as const;

/** contract §14 demo school and the seven demo accounts (dev only). */
export async function seedDemo(prisma: SeedClient, roles: SystemRoleIds): Promise<void> {
  const org = await seedOrganisation(prisma);
  await seedAcademics(prisma, org);
  const place = { schoolId: org.school.id, branchId: org.branch.id };

  const admin = await ensureUser(prisma, { email: 'admin@eschool.local', name: 'Demo Admin', password: PASSWORD, resetPassword: true });
  await ensureAssignment(prisma, { userId: admin.id, roleId: roles.SUPER_ADMIN, scopeType: 'GLOBAL' });

  for (const [email, name, role] of BRANCH_STAFF) {
    const user = await ensureUser(prisma, { email, name, password: PASSWORD, resetPassword: true });
    await ensureAssignment(prisma, { userId: user.id, roleId: roles[role], scopeType: 'BRANCH', ...place });
    if (role === RoleKey.PRINCIPAL) {
      await prisma.branch.update({ where: { id: org.branch.id }, data: { principalUserId: user.id } });
    }
  }

  const parent = await ensureUser(prisma, { email: 'parent@eschool.local', name: 'Demo Parent', password: PASSWORD, resetPassword: true });
  await ensureAssignment(prisma, { userId: parent.id, roleId: roles.PARENT, scopeType: 'GUARDIAN', schoolId: org.school.id });

  const both = await ensureUser(prisma, { email: 'teacherparent@eschool.local', name: 'Demo Teacher Parent', password: PASSWORD, resetPassword: true });
  await ensureAssignment(prisma, { userId: both.id, roleId: roles.TEACHER, scopeType: 'BRANCH', ...place });
  await ensureAssignment(prisma, { userId: both.id, roleId: roles.PARENT, scopeType: 'GUARDIAN', schoolId: org.school.id });
}
