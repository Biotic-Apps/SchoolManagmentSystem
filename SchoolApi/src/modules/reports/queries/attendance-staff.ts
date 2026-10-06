import { TALLY_COLUMNS, tally, type Mark } from './attendance-tally';
import { branchName, monthRange, str, type ReportQuery } from './report-query';

export const attendanceStaff: ReportQuery = async ({ prisma, params }) => {
  const branchId = str(params, 'branchId');
  const month = str(params, 'month');
  const records = await prisma.staffAttendance.findMany({
    where: { branchId, date: monthRange(month) },
    select: {
      status: true,
      staff: {
        select: { id: true, name: true, employeeNo: true, designation: true },
      },
    },
  });
  const byStaff = new Map<
    string,
    { staff: (typeof records)[number]['staff']; marks: Mark[] }
  >();
  for (const r of records) {
    const group = byStaff.get(r.staff.id) ?? { staff: r.staff, marks: [] };
    group.marks.push(r.status);
    byStaff.set(r.staff.id, group);
  }
  const rows = [...byStaff.values()]
    .sort((a, b) => a.staff.name.localeCompare(b.staff.name))
    .map(({ staff, marks }) => ({
      employeeNo: staff.employeeNo,
      name: staff.name,
      designation: staff.designation,
      ...tally(marks),
    }));
  return {
    title: `Staff attendance — ${await branchName(prisma, branchId)} — ${month}`,
    columns: [
      { key: 'employeeNo', header: 'Employee No' },
      { key: 'name', header: 'Name' },
      { key: 'designation', header: 'Designation' },
      ...TALLY_COLUMNS,
    ],
    rows,
  };
};
