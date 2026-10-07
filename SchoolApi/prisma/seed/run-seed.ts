import { assertPasswordPolicy } from '../../src/core/auth/password/password-policy';
import type { SeedClient } from './client';
import { seedDemo } from './demo';
import { seedPermissions } from './permissions';
import { seedSystemRoles } from './system-roles';
import { ensureAssignment, ensureUser } from './users';

export interface SeedOptions {
  demo: boolean;
  resetSystemRoles: boolean;
  adminEmail?: string;
  adminPassword?: string;
}

export const DEMO_PASSWORD = 'Demo@1234';

export async function runSeed(prisma: SeedClient, options: SeedOptions): Promise<void> {
  await seedPermissions(prisma);
  const roles = await seedSystemRoles(prisma, options.resetSystemRoles);

  const email = options.adminEmail ?? (options.demo ? 'admin@eschool.local' : undefined);
  const password = options.adminPassword ?? (options.demo ? DEMO_PASSWORD : undefined);
  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required');
  }
  assertPasswordPolicy(password);
  const admin = await ensureUser(prisma, {
    email,
    name: 'Super Admin',
    password,
    resetPassword: options.demo,
    mustChangePassword: !options.demo,
  });
  await ensureAssignment(prisma, { userId: admin.id, roleId: roles.SUPER_ADMIN, scopeType: 'GLOBAL' });
  console.log(`Seed: catalogue, system roles and super admin ${email} ready.`);

  if (options.demo) {
    await seedDemo(prisma, roles);
    console.log(`Seed: demo data ready (password ${DEMO_PASSWORD}).`);
  }
}
