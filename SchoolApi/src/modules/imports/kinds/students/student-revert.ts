import { ids, type Db } from '../kind-handler';
import { ReferenceReport } from '../shared/references';

type StudentUse = { studentId: string };

/**
 * Deletes imported students, their import enrollments/links and guardians
 * the import created. Anything else pointing at them → 409 with details.
 */
export async function revertStudents(
  tx: Db,
  created: Record<string, unknown>,
): Promise<void> {
  const studentIds = ids(created, 'students');
  const enrollmentIds = ids(created, 'enrollments');
  const linkIds = ids(created, 'links');
  const guardianIds = ids(created, 'guardians');
  const report = new ReferenceReport();
  const students = await tx.student.findMany({
    where: { id: { in: studentIds } },
    select: { id: true, admissionNo: true },
  });
  const labels = new Map(students.map((s) => [s.id, s.admissionNo]));
  const where = { studentId: { in: studentIds } };
  const pick = { studentId: true } as const;
  const distinct: ['studentId'] = ['studentId'];
  const uses: [string, Promise<StudentUse[]>][] = [
    [
      'attendance',
      tx.attendanceEntry.findMany({ where, select: pick, distinct }),
    ],
    ['invoices', tx.invoice.findMany({ where, select: pick, distinct })],
    [
      'ledger entries',
      tx.ledgerEntry.findMany({ where, select: pick, distinct }),
    ],
    ['payments', tx.payment.findMany({ where, select: pick, distinct })],
    ['marks', tx.mark.findMany({ where, select: pick, distinct })],
    ['results', tx.examResult.findMany({ where, select: pick, distinct })],
    ['ID cards', tx.idCard.findMany({ where, select: pick, distinct })],
    [
      'certificates',
      tx.certificate.findMany({ where, select: pick, distinct }),
    ],
    [
      'other enrollments',
      tx.enrollment.findMany({
        where: { ...where, id: { notIn: enrollmentIds } },
        select: pick,
        distinct,
      }),
    ],
    [
      'other guardian links',
      tx.studentGuardian.findMany({
        where: { ...where, id: { notIn: linkIds } },
        select: pick,
        distinct,
      }),
    ],
  ];
  for (const [usedBy, query] of uses) {
    const rows = await query;
    report.addAll(
      'Student',
      labels,
      rows.map((r) => r.studentId),
      usedBy,
    );
  }
  const documents = await tx.document.findMany({
    where: { ownerType: 'STUDENT', ownerId: { in: studentIds } },
    select: { ownerId: true },
  });
  report.addAll(
    'Student',
    labels,
    documents.map((d) => d.ownerId),
    'documents',
  );
  await checkGuardians(tx, report, guardianIds, linkIds);
  report.throwIfAny();

  await tx.studentGuardian.deleteMany({ where: { id: { in: linkIds } } });
  await tx.enrollment.deleteMany({ where: { id: { in: enrollmentIds } } });
  await tx.student.deleteMany({ where: { id: { in: studentIds } } });
  await tx.guardian.deleteMany({ where: { id: { in: guardianIds } } });
}

/** Guardians the import created must not be used elsewhere since. */
export async function checkGuardians(
  tx: Db,
  report: ReferenceReport,
  guardianIds: string[],
  linkIds: string[],
  ownUserIds: ReadonlySet<string> = new Set(),
): Promise<void> {
  if (guardianIds.length === 0) return;
  const guardians = await tx.guardian.findMany({
    where: { id: { in: guardianIds } },
    select: { id: true, name: true, userId: true },
  });
  const labels = new Map(guardians.map((g) => [g.id, g.name]));
  for (const g of guardians) {
    if (g.userId && !ownUserIds.has(g.userId))
      report.add('Guardian', g.id, g.name, 'login account');
  }
  const links = await tx.studentGuardian.findMany({
    where: { guardianId: { in: guardianIds }, id: { notIn: linkIds } },
    select: { guardianId: true },
    distinct: ['guardianId'],
  });
  report.addAll(
    'Guardian',
    labels,
    links.map((l) => l.guardianId),
    'linked to other students',
  );
  const requests = await tx.childLinkRequest.findMany({
    where: { guardianId: { in: guardianIds } },
    select: { guardianId: true },
    distinct: ['guardianId'],
  });
  report.addAll(
    'Guardian',
    labels,
    requests.map((r) => r.guardianId),
    'child link requests',
  );
}
