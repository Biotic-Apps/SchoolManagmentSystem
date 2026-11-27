import { Injectable } from '@nestjs/common';
import { today } from '../../../core/common/week';
import { PrincipalRepository } from '../../branches/principal/principal.repository';
import { UsersRepository } from '../../users/users.repository';
import { onUnique, userEmailTaken, userPhoneTaken } from '../setup-errors';
import type { PlacedBranch, SetupContext } from './setup-context';

export interface PrincipalAccount {
  name: string;
  email: string | null;
  phone: string | null;
  passwordHash: string;
  mustChangePassword: boolean;
}

/**
 * Principal login + BRANCH PRINCIPAL assignment + branch.principalUserId,
 * through the same `assign` as PUT /branches/:id/principal (contract §1 item 3),
 * plus the principal's staff profile (designation PRINCIPAL), without which
 * they cannot apply for leave or appear in staff attendance / payroll.
 */
@Injectable()
export class PrincipalStep {
  constructor(
    private readonly users: UsersRepository,
    private readonly principals: PrincipalRepository,
  ) {}

  async run(
    ctx: SetupContext,
    branch: PlacedBranch,
    account: PrincipalAccount,
  ) {
    await this.assertFree(ctx, account);
    const user = await this.users
      .create({ ...account, createdById: ctx.actorId }, [], ctx.tx)
      .catch(
        onUnique(() => (account.email ? userEmailTaken() : userPhoneTaken())),
      );
    await this.principals.assign(ctx.tx, branch, user.id, ctx.actorId);
    const staff = await ctx.tx.staff.create({
      data: {
        schoolId: branch.schoolId,
        branchId: branch.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: 'PRINCIPAL',
        joinDate: today(),
        createdById: ctx.actorId,
      },
    });
    ctx.audit.push(
      {
        action: 'user.create',
        entityType: 'User',
        entityId: user.id,
        schoolId: branch.schoolId,
        branchId: branch.id,
        after: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
      {
        action: 'branch.principal_change',
        entityType: 'Branch',
        entityId: branch.id,
        schoolId: branch.schoolId,
        branchId: branch.id,
        before: { principalUserId: null },
        after: { principalUserId: user.id, endedFor: [] },
      },
      {
        action: 'staff.create',
        entityType: 'Staff',
        entityId: staff.id,
        schoolId: branch.schoolId,
        branchId: branch.id,
        after: { id: staff.id, userId: user.id, designation: 'PRINCIPAL' },
      },
    );
    return user;
  }

  private async assertFree(ctx: SetupContext, account: PrincipalAccount) {
    if (account.email) {
      const taken = await ctx.tx.user.count({
        where: { email: account.email },
      });
      if (taken > 0) throw userEmailTaken();
    }
    if (account.phone) {
      const taken = await ctx.tx.user.count({
        where: { phone: account.phone },
      });
      if (taken > 0) throw userPhoneTaken();
    }
  }
}
