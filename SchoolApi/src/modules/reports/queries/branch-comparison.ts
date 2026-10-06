import { percent } from '../report-table';
import { monthRange, str, type ReportQuery } from './report-query';

type Sums = Map<string, bigint>;
const sums = (
  rows: { branchId: string; _sum: { amountMinor: bigint | null } }[],
): Sums => new Map(rows.map((r) => [r.branchId, r._sum.amountMinor ?? 0n]));

/** Per branch of a school: students, attendance %, billed, collected, expenses. */
export const branchComparison: ReportQuery = async ({ prisma, params }) => {
  const schoolId = str(params, 'schoolId');
  const month = str(params, 'month');
  const range = monthRange(month);
  const [school, branches, students, marks, billed, collected, expenses] =
    await Promise.all([
      prisma.school.findUnique({ where: { id: schoolId } }),
      prisma.branch.findMany({
        where: { schoolId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      }),
      prisma.enrollment.groupBy({
        by: ['branchId'],
        where: { schoolId, status: 'ACTIVE' },
        _count: { _all: true },
      }),
      prisma.attendanceRegister.findMany({
        where: {
          schoolId,
          date: range,
          status: { in: ['SUBMITTED', 'LOCKED'] },
        },
        select: { branchId: true, entries: { select: { status: true } } },
      }),
      prisma.invoice.groupBy({
        by: ['branchId'],
        where: {
          schoolId,
          period: month,
          status: { notIn: ['DRAFT', 'CANCELLED'] },
        },
        _sum: { totalMinor: true },
      }),
      prisma.payment.groupBy({
        by: ['branchId'],
        where: { schoolId, status: { not: 'REVERSED' }, receivedOn: range },
        _sum: { amountMinor: true },
      }),
      prisma.expense.groupBy({
        by: ['branchId'],
        where: {
          schoolId,
          status: { notIn: ['DRAFT', 'REJECTED'] },
          billDate: range,
        },
        _sum: { amountMinor: true },
      }),
    ]);
  const studentCount = new Map(
    students.map((s) => [s.branchId, s._count._all]),
  );
  const attendance = new Map<string, { present: number; base: number }>();
  for (const register of marks) {
    const a = attendance.get(register.branchId) ?? { present: 0, base: 0 };
    for (const e of register.entries) {
      if (e.status === 'LEAVE') continue;
      a.base += 2;
      if (e.status === 'PRESENT' || e.status === 'LATE') a.present += 2;
      if (e.status === 'HALF_DAY') a.present += 1;
    }
    attendance.set(register.branchId, a);
  }
  const billedBy = new Map(
    billed.map((b) => [b.branchId, b._sum.totalMinor ?? 0n]),
  );
  const collectedBy = sums(collected);
  const expensesBy = sums(expenses);
  return {
    title: `Branch comparison — ${school?.name ?? 'School'} — ${month}`,
    columns: [
      { key: 'branch', header: 'Branch' },
      { key: 'students', header: 'Active students', kind: 'int' },
      { key: 'attendance', header: 'Attendance %', kind: 'percent' },
      { key: 'billed', header: 'Billed', kind: 'money' },
      { key: 'collected', header: 'Collected', kind: 'money' },
      { key: 'expenses', header: 'Expenses', kind: 'money' },
    ],
    rows: branches.map((b) => {
      const a = attendance.get(b.id);
      return {
        branch: b.name,
        students: studentCount.get(b.id) ?? 0,
        attendance: a ? percent(a.present, a.base) : null,
        billed: billedBy.get(b.id) ?? 0n,
        collected: collectedBy.get(b.id) ?? 0n,
        expenses: expensesBy.get(b.id) ?? 0n,
      };
    }),
  };
};
