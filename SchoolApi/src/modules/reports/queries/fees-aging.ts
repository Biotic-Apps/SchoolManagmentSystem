import { formatDate } from '../../../core/common/dates';
import { AGING_COLUMNS, ageBalances } from './aging-buckets';
import { openBalances, studentLabels } from './open-invoices';
import { branchName, str, type ReportQuery } from './report-query';

export const feesAging: ReportQuery = async ({ prisma, params, today }) => {
  const branchId = str(params, 'branchId');
  const aged = ageBalances(await openBalances(prisma, branchId), today);
  const labels = await studentLabels(
    prisma,
    aged.map((r) => r.studentId),
  );
  return {
    title: `Fee aging — ${await branchName(prisma, branchId)} — as of ${formatDate(today)}`,
    columns: [
      { key: 'admissionNo', header: 'Admission No' },
      { key: 'student', header: 'Student' },
      { key: 'className', header: 'Class' },
      ...AGING_COLUMNS,
    ],
    rows: aged.map((r) => {
      const label = labels.get(r.studentId);
      return {
        admissionNo: label?.admissionNo ?? null,
        student: label?.name ?? null,
        className: label?.className ?? null,
        d0_30: r.d0_30,
        d31_60: r.d31_60,
        d61_90: r.d61_90,
        d90plus: r.d90plus,
        total: r.total,
      };
    }),
  };
};
