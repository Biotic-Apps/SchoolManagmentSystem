import { ids, type Db } from '../kind-handler';
import { ImportAccounts, importedAccounts } from '../shared/import-accounts';
import { ReferenceReport } from '../shared/references';

/**
 * Deletes imported staff, their assignments (+ synced role assignments) and
 * logins the import created; 409 when payroll, attendance, timetable or
 * other records use them.
 */
export async function revertStaff(
  tx: Db,
  accounts: ImportAccounts,
  created: Record<string, unknown>,
): Promise<{ userIds: string[] }> {
  const staffIds = ids(created, 'staff');
  const assignmentIds = ids(created, 'assignments');
  const imported = importedAccounts(created);
  const report = new ReferenceReport();
  const staff = await tx.staff.findMany({
    where: { id: { in: staffIds } },
    select: { id: true, name: true },
  });
  const labels = new Map(staff.map((s) => [s.id, s.name]));
  const where = { staffId: { in: staffIds } };
  const pick = { staffId: true } as const;
  const distinct: ['staffId'] = ['staffId'];
  const uses: [string, Promise<{ staffId: string | null }[]>][] = [
    [
      'staff attendance',
      tx.staffAttendance.findMany({ where, select: pick, distinct }),
    ],
    [
      'leave requests',
      tx.leaveRequest.findMany({ where, select: pick, distinct }),
    ],
    [
      'salary structures',
      tx.salaryStructure.findMany({ where, select: pick, distinct }),
    ],
    ['payroll', tx.payrollLine.findMany({ where, select: pick, distinct })],
    [
      'payroll adjustments',
      tx.payrollAdjustment.findMany({ where, select: pick, distinct }),
    ],
    ['timetable', tx.timetableSlot.findMany({ where, select: pick, distinct })],
    [
      'other assignments',
      tx.staffAssignment.findMany({
        where: { ...where, id: { notIn: assignmentIds } },
        select: pick,
        distinct,
      }),
    ],
  ];
  for (const [usedBy, query] of uses) {
    const rows = await query;
    report.addAll(
      'Staff',
      labels,
      rows.map((r) => r.staffId),
      usedBy,
    );
  }
  const substitutes = await tx.timetableOverride.findMany({
    where: {
      OR: [
        { substituteStaffId: { in: staffIds } },
        { originalStaffId: { in: staffIds } },
      ],
    },
    select: { substituteStaffId: true, originalStaffId: true },
  });
  report.addAll(
    'Staff',
    labels,
    substitutes
      .flatMap((o) => [o.substituteStaffId, o.originalStaffId])
      .filter((id) => id && labels.has(id)),
    'timetable overrides',
  );
  const documents = await tx.document.findMany({
    where: { ownerType: 'STAFF', ownerId: { in: staffIds } },
    select: { ownerId: true },
  });
  report.addAll(
    'Staff',
    labels,
    documents.map((d) => d.ownerId),
    'documents',
  );
  await accounts.check(tx, report, imported);
  report.throwIfAny();

  await tx.section.updateMany({
    where: { classTeacherStaffId: { in: staffIds } },
    data: { classTeacherStaffId: null },
  });
  await tx.staffAssignment.deleteMany({ where: { id: { in: assignmentIds } } });
  await tx.roleAssignment.deleteMany({
    where: { id: { in: ids(created, 'roleAssignments') } },
  });
  await tx.staff.deleteMany({ where: { id: { in: staffIds } } });
  return { userIds: await accounts.remove(tx, imported) };
}
