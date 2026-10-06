import { Injectable } from '@nestjs/common';
import {
  AccountProvisioner,
  type AccountInput,
} from '../../../../core/accounts/account-provisioner';
import type { Db } from '../kind-handler';
import type { ReferenceReport } from './references';

/** What an import did to one login (stored for revert; no password). */
export interface ImportedAccount {
  userId: string;
  created: boolean;
  roleAssignmentIds: string[];
}

/**
 * Wraps the shared AccountProvisioner for imports: remembers which login and
 * role assignments were created, and drops the temporary password (it is
 * never stored or returned; users sign in through "forgot password").
 */
@Injectable()
export class ImportAccounts {
  constructor(private readonly provisioner: AccountProvisioner) {}

  async provision(tx: Db, input: AccountInput): Promise<ImportedAccount> {
    const before = await this.heldAssignments(tx, input);
    const account = await this.provisioner.provision(tx, input);
    const after = await tx.roleAssignment.findMany({
      where: { userId: account.userId },
      select: { id: true },
    });
    return {
      userId: account.userId,
      created: account.created,
      roleAssignmentIds: after.map((r) => r.id).filter((id) => !before.has(id)),
    };
  }

  /** Logins the import created that were used since → in use. */
  async check(
    tx: Db,
    report: ReferenceReport,
    accounts: ImportedAccount[],
  ): Promise<void> {
    const createdIds = accounts.filter((a) => a.created).map((a) => a.userId);
    if (createdIds.length === 0) return;
    const users = await tx.user.findMany({
      where: { id: { in: createdIds } },
      select: { id: true, name: true, lastLoginAt: true },
    });
    for (const user of users) {
      if (user.lastLoginAt) {
        report.add('User', user.id, user.name, 'has signed in');
      }
    }
  }

  /** Removes created role assignments; deletes logins the import created. */
  async remove(tx: Db, accounts: ImportedAccount[]): Promise<string[]> {
    const createdIds = accounts.filter((a) => a.created).map((a) => a.userId);
    await tx.roleAssignment.deleteMany({
      where: {
        OR: [
          { id: { in: accounts.flatMap((a) => a.roleAssignmentIds) } },
          { userId: { in: createdIds } },
        ],
      },
    });
    await tx.guardian.updateMany({
      where: { userId: { in: createdIds } },
      data: { userId: null },
    });
    await tx.user.deleteMany({ where: { id: { in: createdIds } } });
    return accounts.map((a) => a.userId);
  }

  private async heldAssignments(
    tx: Db,
    input: AccountInput,
  ): Promise<Set<string>> {
    const email = input.email?.trim().toLowerCase() || null;
    const or = [
      ...(email ? [{ email }] : []),
      ...(input.phone ? [{ phone: input.phone }] : []),
    ];
    if (or.length === 0) return new Set();
    const rows = await tx.roleAssignment.findMany({
      where: { user: { OR: or } },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }
}

export const importedAccounts = (
  created: Record<string, unknown>,
): ImportedAccount[] =>
  Array.isArray(created.accounts)
    ? (created.accounts as ImportedAccount[])
    : [];
