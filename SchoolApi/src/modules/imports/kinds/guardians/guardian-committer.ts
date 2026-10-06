import { Injectable } from '@nestjs/common';
import { RoleKey } from '../../../../core/rbac/role-key.enum';
import type { ParsedRow } from '../../validation/sheet';
import {
  ids,
  type CommitResult,
  type Db,
  type ImportTarget,
  type KindCommitter,
} from '../kind-handler';
import { GuardianLinker } from '../shared/guardian-linker';
import {
  ImportAccounts,
  importedAccounts,
  type ImportedAccount,
} from '../shared/import-accounts';
import { ReferenceReport } from '../shared/references';
import { checkGuardians } from '../students/student-revert';
import type { GuardianContext } from './guardian-context';
import type { GuardianImportRow } from './guardian-validator';

/** GUARDIANS: reuse/create guardian, VERIFIED link, optional PARENT login. */
@Injectable()
export class GuardianCommitter implements KindCommitter<
  GuardianImportRow,
  GuardianContext
> {
  readonly kind = 'GUARDIANS' as const;

  constructor(
    private readonly linker: GuardianLinker,
    private readonly accounts: ImportAccounts,
  ) {}

  async commit(
    tx: Db,
    target: ImportTarget,
    rows: ParsedRow<GuardianImportRow>[],
  ): Promise<CommitResult> {
    const guardians: string[] = [];
    const links: string[] = [];
    const accounts: (ImportedAccount & { guardianId: string })[] = [];
    for (const { data: d } of rows) {
      const linked = await this.linker.link(tx, target, {
        studentId: d.studentId!,
        guardian: {
          name: d.name!,
          relation: d.relation!,
          phone: d.phone!,
          cnic: d.cnic ?? null,
          email: d.email ?? null,
        },
        relation: d.relation!,
        isPrimary: d.isPrimary ?? false,
      });
      if (linked.guardianCreated) guardians.push(linked.guardianId);
      links.push(linked.linkId);
      if (!d.createAccount) continue;
      const current = await tx.guardian.findUniqueOrThrow({
        where: { id: linked.guardianId },
      });
      if (current.userId) continue;
      const account = await this.accounts.provision(tx, {
        name: current.name,
        email: current.email,
        phone: current.phone,
        roleKey: RoleKey.PARENT,
        scopeType: 'GUARDIAN',
        schoolId: target.schoolId,
        grantedById: target.actorId,
      });
      await tx.guardian.update({
        where: { id: current.id },
        data: { userId: account.userId },
      });
      accounts.push({ ...account, guardianId: current.id });
    }
    return {
      created: { guardians, links, accounts },
      reconciliation: {
        created: rows.length,
        links: links.length,
        guardiansCreated: guardians.length,
        guardiansReused: rows.length - guardians.length,
        accountsCreated: accounts.filter((a) => a.created).length,
        accountsAttached: accounts.filter((a) => !a.created).length,
      },
      userIds: accounts.map((a) => a.userId),
    };
  }

  async revert(
    tx: Db,
    _target: ImportTarget,
    created: Record<string, unknown>,
  ): Promise<{ userIds: string[] }> {
    const guardianIds = ids(created, 'guardians');
    const linkIds = ids(created, 'links');
    const accounts = importedAccounts(created) as (ImportedAccount & {
      guardianId: string;
    })[];
    const report = new ReferenceReport();
    await this.accounts.check(tx, report, accounts);
    await checkGuardians(
      tx,
      report,
      guardianIds,
      linkIds,
      new Set(accounts.map((a) => a.userId)),
    );
    report.throwIfAny();
    // Logins attached (not created) by the import are detached again.
    await tx.guardian.updateMany({
      where: {
        id: { in: accounts.filter((a) => !a.created).map((a) => a.guardianId) },
      },
      data: { userId: null },
    });
    const userIds = await this.accounts.remove(tx, accounts);
    await tx.studentGuardian.deleteMany({ where: { id: { in: linkIds } } });
    await tx.guardian.deleteMany({ where: { id: { in: guardianIds } } });
    return { userIds };
  }
}
