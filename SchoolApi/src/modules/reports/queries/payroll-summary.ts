import { branchName, str, type ReportQuery } from './report-query';

/** Lines of the branch's payroll run for the month (empty when none). */
export const payrollSummary: ReportQuery = async ({ prisma, params }) => {
  const branchId = str(params, 'branchId');
  const month = str(params, 'month');
  const run = await prisma.payrollRun.findUnique({
    where: { branchId_month: { branchId, month } },
    select: {
      status: true,
      lines: {
        select: {
          designation: true,
          basicMinor: true,
          allowancesMinor: true,
          deductionsMinor: true,
          leaveDeductionMinor: true,
          adjustmentsMinor: true,
          netMinor: true,
          paidMinor: true,
          status: true,
          staff: { select: { name: true, employeeNo: true } },
        },
      },
    },
  });
  const rows = (run?.lines ?? [])
    .sort((a, b) => a.staff.name.localeCompare(b.staff.name))
    .map((line) => ({
      employeeNo: line.staff.employeeNo,
      name: line.staff.name,
      designation: line.designation,
      basic: line.basicMinor,
      allowances: line.allowancesMinor,
      deductions: line.deductionsMinor + line.leaveDeductionMinor,
      adjustments: line.adjustmentsMinor,
      net: line.netMinor,
      paid: line.paidMinor,
      balance: line.netMinor - line.paidMinor,
      status: line.status,
    }));
  return {
    title: `Payroll summary — ${await branchName(prisma, branchId)} — ${month}${run ? ` (${run.status})` : ' (no run)'}`,
    columns: [
      { key: 'employeeNo', header: 'Employee No' },
      { key: 'name', header: 'Name' },
      { key: 'designation', header: 'Designation' },
      { key: 'basic', header: 'Basic', kind: 'money' },
      { key: 'allowances', header: 'Allowances', kind: 'money' },
      { key: 'deductions', header: 'Deductions', kind: 'money' },
      { key: 'adjustments', header: 'Adjustments', kind: 'money' },
      { key: 'net', header: 'Net', kind: 'money' },
      { key: 'paid', header: 'Paid', kind: 'money' },
      { key: 'balance', header: 'Balance', kind: 'money' },
      { key: 'status', header: 'Status' },
    ],
    rows,
  };
};
