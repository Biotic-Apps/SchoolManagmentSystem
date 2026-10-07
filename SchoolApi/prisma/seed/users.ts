import type { ScopeType } from '../../src/generated/prisma/client';
import { PasswordHasher } from '../../src/core/auth/password/password-hasher';
import type { SeedClient } from './client';

const hasher = new PasswordHasher();

export interface SeedUser {
  email: string;
  name: string;
  password: string;
  /** Overwrite the password of an existing account (demo accounts only). */
  resetPassword: boolean;
  /** New account must change its password at first sign-in (production bootstrap). */
  mustChangePassword?: boolean;
}

export async function ensureUser(prisma: SeedClient, user: SeedUser) {
  const existing = await prisma.user.findUnique({ where: { email: user.email } });
  if (existing && !user.resetPassword) return existing;
  const passwordHash = await hasher.hash(user.password);
  return prisma.user.upsert({
    where: { email: user.email },
    create: {
      email: user.email,
      name: user.name,
      passwordHash,
      mustChangePassword: user.mustChangePassword ?? false,
    },
    update: {
      name: user.name,
      passwordHash,
      status: 'ACTIVE',
      mustChangePassword: false,
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });
}

export interface SeedAssignment {
  userId: string;
  roleId: string;
  scopeType: ScopeType;
  schoolId?: string;
  branchId?: string;
}

/** Creates the assignment unless an identical one is already in force. */
export async function ensureAssignment(prisma: SeedClient, a: SeedAssignment): Promise<void> {
  const found = await prisma.roleAssignment.findFirst({
    where: {
      userId: a.userId,
      roleId: a.roleId,
      scopeType: a.scopeType,
      schoolId: a.schoolId ?? null,
      branchId: a.branchId ?? null,
      revokedAt: null,
      validUntil: null,
    },
  });
  if (!found) await prisma.roleAssignment.create({ data: a });
}
