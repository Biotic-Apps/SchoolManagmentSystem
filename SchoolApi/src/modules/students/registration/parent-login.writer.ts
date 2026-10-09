import { Injectable } from '@nestjs/common';
import type { Guardian, Prisma } from '../../../generated/prisma/client';
import { AccountProvisioner } from '../../../core/accounts/account-provisioner';
import { normalizePhone } from '../../../core/auth/identifier';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { ParentLoginDto } from '../dto/parent-login.dto';

type Db = Prisma.TransactionClient;

/**
 * Gives a guardian a PARENT login (temporary password, must change at first
 * sign-in). Never throws on a clash with another login: it reports SKIPPED so
 * an admission is not blocked by a reused email or phone.
 */
@Injectable()
export class ParentLoginWriter {
  constructor(private readonly accounts: AccountProvisioner) {}

  async ensure(
    tx: Db,
    guardian: Guardian,
    actorId: string,
  ): Promise<ParentLoginDto> {
    const base = { guardianId: guardian.id, guardianName: guardian.name };
    if (guardian.userId) {
      const user = await tx.user.findUnique({
        where: { id: guardian.userId },
        select: { email: true, phone: true },
      });
      return { ...base, ...existing(user), status: 'EXISTING' };
    }
    const email = guardian.email?.trim().toLowerCase() || null;
    const phone = normalizePhone(guardian.phone);
    const reason = await this.clash(tx, email, phone);
    if (reason) {
      return {
        ...base,
        status: 'SKIPPED',
        email,
        phone,
        temporaryPassword: null,
        reason,
      };
    }
    const account = await this.accounts.provision(tx, {
      name: guardian.name,
      email,
      phone,
      roleKey: RoleKey.PARENT,
      scopeType: 'GUARDIAN',
      schoolId: guardian.schoolId,
      grantedById: actorId,
    });
    await tx.guardian.update({
      where: { id: guardian.id },
      data: { userId: account.userId },
    });
    if (!account.created) {
      const user = await tx.user.findUnique({
        where: { id: account.userId },
        select: { email: true, phone: true },
      });
      return { ...base, ...existing(user), status: 'EXISTING' };
    }
    return {
      ...base,
      status: 'CREATED',
      email,
      phone,
      temporaryPassword: account.temporaryPassword,
      reason: null,
    };
  }

  /** Why the email/phone cannot become this guardian's login, if so. */
  private async clash(
    tx: Db,
    email: string | null,
    phone: string,
  ): Promise<string | null> {
    const users = await tx.user.findMany({
      where: { OR: [...(email ? [{ email }] : []), { phone }] },
      select: { id: true },
    });
    if (users.length > 1)
      return 'The email and phone belong to two different sign-ins';
    if (users.length === 0) return null;
    const taken = await tx.guardian.count({ where: { userId: users[0].id } });
    return taken > 0
      ? 'That email or phone already signs in for another guardian'
      : null;
  }
}

function existing(user: { email: string | null; phone: string | null } | null) {
  return {
    email: user?.email ?? null,
    phone: user?.phone ?? null,
    temporaryPassword: null,
    reason: null,
  };
}
