import { formatDate } from '../../../core/common/dates';
import { ageBalances } from './aging-buckets';
import { openBalances, studentLabels } from './open-invoices';
import { branchName, daysBetween, str, type ReportQuery } from './report-query';

/** Students whose overdue balance is at least `minDays` (default 1) past due. */
export const feesDefaulters: ReportQuery = async ({
  prisma,
  params,
  today,
}) => {
  const branchId = str(params, 'branchId');
  const minDays = Math.max(1, Number(params.minDays ?? 1));
  const overdue = (await openBalances(prisma, branchId)).filter(
    (b) => daysBetween(b.dueDate, today) >= minDays,
  );
  const aged = ageBalances(overdue, today);
  const labels = await studentLabels(
    prisma,
    aged.map((r) => r.studentId),
  );
  return {
    title: `Fee defaulters (${minDays}+ days overdue) — ${await branchName(prisma, branchId)}`,
    columns: [
      { key: 'admissionNo', header: 'Admission No' },
      { key: 'student', header: 'Student' },
      { key: 'className', header: 'Class' },
      { key: 'invoices', header: 'Overdue invoices', kind: 'int' },
      { key: 'oldestDue', header: 'Oldest due date' },
      { key: 'daysOverdue', header: 'Days overdue', kind: 'int' },
      { key: 'overdue', header: 'Overdue amount', kind: 'money' },
    ],
    rows: aged.map((r) => {
      const label = labels.get(r.studentId);
      return {
        admissionNo: label?.admissionNo ?? null,
        student: label?.name ?? null,
        className: label?.className ?? null,
        invoices: r.invoices,
        oldestDue: formatDate(r.oldestDue),
        daysOverdue: r.maxDays,
        overdue: r.total,
      };
    }),
  };
};
