import { Injectable } from '@nestjs/common';
import { parseDate } from '../../../../core/common/dates';
import { createRoleAssignment } from '../../../staff/assignments/assignment-role-sync';
import type { ParsedRow } from '../../validation/sheet';
import type {
  CommitResult,
  Db,
  ImportTarget,
  KindCommitter,
} from '../kind-handler';
import {
  ImportAccounts,
  type ImportedAccount,
} from '../shared/import-accounts';
import { revertStaff } from './staff-revert';
import type { StaffContext } from './staff-context';
import type { StaffImportRow } from './staff-validator';

/** STAFF: staff record (+ BRANCH-scoped login) + assignments with role sync. */
@Injectable()
export class StaffCommitter implements KindCommitter<
  StaffImportRow,
  StaffContext
> {
  readonly kind = 'STAFF' as const;

  constructor(private readonly accounts: ImportAccounts) {}

  async commit(
    tx: Db,
    target: ImportTarget,
    rows: ParsedRow<StaffImportRow>[],
  ): Promise<CommitResult> {
    const created = {
      staff: [] as string[],
      assignments: [] as string[],
      roleAssignments: [] as string[],
      classTeacherSections: [] as string[],
      accounts: [] as ImportedAccount[],
    };
    for (const { data: d } of rows) {
      const account = d.createAccount
        ? await this.accounts.provision(tx, {
            name: d.name!,
            email: d.email,
            phone: d.phone,
            roleKey: d.roleKey!,
            scopeType: 'BRANCH',
            schoolId: target.schoolId,
            branchId: target.branchId,
            grantedById: target.actorId,
          })
        : null;
      if (account) created.accounts.push(account);
      const staff = await tx.staff.create({
        data: {
          schoolId: target.schoolId,
          branchId: target.branchId,
          userId: account?.userId,
          name: d.name!,
          email: d.email ?? undefined,
          phone: d.phone,
          designation: d.designation!,
          joinDate: parseDate(d.joiningDate!),
          cnic: d.cnic,
          createdById: target.actorId,
        },
      });
      created.staff.push(staff.id);
      for (const a of d.assignments ?? []) {
        const roleAssignmentId = account
          ? await createRoleAssignment(tx, {
              userId: account.userId,
              kind: a.kind,
              schoolId: target.schoolId,
              branchId: target.branchId,
              sectionId: a.sectionId!,
              subjectId: a.subjectId ?? null,
              validUntil: null,
              grantedById: target.actorId,
            })
          : null;
        if (roleAssignmentId) created.roleAssignments.push(roleAssignmentId);
        const row = await tx.staffAssignment.create({
          data: {
            schoolId: target.schoolId,
            branchId: target.branchId,
            sessionId: target.sessionId,
            staffId: staff.id,
            kind: a.kind,
            sectionId: a.sectionId!,
            subjectId: a.kind === 'SUBJECT_TEACHER' ? a.subjectId : undefined,
            roleAssignmentId,
            createdById: target.actorId,
          },
        });
        created.assignments.push(row.id);
        if (a.kind === 'CLASS_TEACHER') {
          await tx.section.update({
            where: { id: a.sectionId },
            data: { classTeacherStaffId: staff.id },
          });
          created.classTeacherSections.push(a.sectionId!);
        }
      }
    }
    return {
      created,
      reconciliation: {
        created: rows.length,
        assignments: created.assignments.length,
        accountsCreated: created.accounts.filter((a) => a.created).length,
        accountsAttached: created.accounts.filter((a) => !a.created).length,
      },
      userIds: created.accounts.map((a) => a.userId),
    };
  }

  revert(tx: Db, _target: ImportTarget, created: Record<string, unknown>) {
    return revertStaff(tx, this.accounts, created);
  }
}
