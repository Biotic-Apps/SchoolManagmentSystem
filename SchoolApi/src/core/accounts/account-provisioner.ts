import { Injectable } from '@nestjs/common';
import type { Prisma, ScopeType } from '../../generated/prisma/client';
import { normalizePhone } from '../auth/identifier';
import { PasswordHasher } from '../auth/password/password-hasher';
import { generateTemporaryPassword } from '../auth/password/temporary-password';
import { conflict, invalid } from '../common/errors/errors';
import { AccessCache } from '../rbac/access/access-cache';

export interface AccountInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  roleKey: string;
  scopeType: ScopeType;
  schoolId: string;
  branchId?: string | null;
  grantedById: string;
}

export interface ProvisionedAccount {
  userId: string;
  /** Only when a new login was created; shown once. */
  temporaryPassword: string | null;
  created: boolean;
}

/**
 * Creates (or attaches to) the login of a staff member or guardian and grants
 * one role assignment. New accounts must change the temporary password.
 */
@Injectable()
export class AccountProvisioner {
  constructor(
    private readonly hasher: PasswordHasher,
    private readonly access: AccessCache,
  ) {}

  async provision(
    tx: Prisma.TransactionClient,
    input: AccountInput,
  ): Promise<ProvisionedAccount> {
    const email = input.email?.trim().toLowerCase() || null;
    const phone = input.phone ? normalizePhone(input.phone) : null;
    if (!email && !phone)
      throw invalid('email or phone is required for an account');

    const role = await tx.role.findFirst({
      where: { key: input.roleKey, schoolId: null, status: 'ACTIVE' },
    });
    if (!role) throw invalid(`Unknown role ${input.roleKey}`);

    const existing = await this.findExisting(tx, email, phone);
    let temporaryPassword: string | null = null;
    let userId: string;
    if (existing) {
      userId = existing.id;
    } else {
      temporaryPassword = generateTemporaryPassword();
      const user = await tx.user.create({
        data: {
          name: input.name.trim(),
          email,
          phone,
          passwordHash: await this.hasher.hash(temporaryPassword),
          mustChangePassword: true,
          createdById: input.grantedById,
        },
      });
      userId = user.id;
    }

    const place = {
      userId,
      roleId: role.id,
      scopeType: input.scopeType,
      schoolId: input.schoolId,
      branchId: input.branchId ?? null,
    };
    const held = await tx.roleAssignment.findFirst({
      where: { ...place, revokedAt: null, validUntil: null },
    });
    if (!held) {
      await tx.roleAssignment.create({
        data: { ...place, grantedById: input.grantedById },
      });
    }
    return { userId, temporaryPassword, created: !existing };
  }

  /** New permissions apply on the next request. */
  refresh(userId: string): Promise<void> {
    return this.access.invalidateUser(userId);
  }

  private async findExisting(
    tx: Prisma.TransactionClient,
    email: string | null,
    phone: string | null,
  ) {
    const matches = await tx.user.findMany({
      where: {
        OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
      },
      select: { id: true },
    });
    if (matches.length > 1)
      throw conflict('Email and phone belong to different accounts');
    return matches[0] ?? null;
  }
}
