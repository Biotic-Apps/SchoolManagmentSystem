import { fullName } from '../../students/student.mapper';
import type { ReportRow } from '../report-table';
import { TALLY_COLUMNS, tally, type Mark } from './attendance-tally';
import { branchName, monthRange, str, type ReportQuery } from './report-query';

export interface StudentMarkRow {
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  classOrder: number;
  sectionName: string;
  status: Mark;
}

/** One row per section and student, sorted by class, section, name. */
export function buildAttendanceRows(entries: StudentMarkRow[]): ReportRow[] {
  const groups = new Map<string, { head: StudentMarkRow; marks: Mark[] }>();
  for (const e of entries) {
    const key = `${e.className}|${e.sectionName}|${e.studentId}`;
    const group = groups.get(key) ?? { head: e, marks: [] };
    group.marks.push(e.status);
    groups.set(key, group);
  }
  return [...groups.values()]
    .sort(
      (a, b) =>
        a.head.classOrder - b.head.classOrder ||
        a.head.sectionName.localeCompare(b.head.sectionName) ||
        a.head.studentName.localeCompare(b.head.studentName),
    )
    .map(({ head, marks }) => ({
      className: head.className,
      sectionName: head.sectionName,
      admissionNo: head.admissionNo,
      studentName: head.studentName,
      ...tally(marks),
    }));
}

export const attendanceMonthly: ReportQuery = async ({ prisma, params }) => {
  const branchId = str(params, 'branchId');
  const month = str(params, 'month');
  const entries = await prisma.attendanceEntry.findMany({
    where: {
      register: {
        branchId,
        date: monthRange(month),
        status: { in: ['SUBMITTED', 'LOCKED'] },
      },
    },
    select: {
      status: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNo: true,
        },
      },
      register: {
        select: {
          section: {
            select: {
              name: true,
              schoolClass: { select: { name: true, levelOrder: true } },
            },
          },
        },
      },
    },
  });
  const rows = buildAttendanceRows(
    entries.map((e) => ({
      studentId: e.student.id,
      studentName: fullName(e.student),
      admissionNo: e.student.admissionNo,
      className: e.register.section.schoolClass.name,
      classOrder: e.register.section.schoolClass.levelOrder,
      sectionName: e.register.section.name,
      status: e.status,
    })),
  );
  return {
    title: `Student attendance — ${await branchName(prisma, branchId)} — ${month}`,
    columns: [
      { key: 'className', header: 'Class' },
      { key: 'sectionName', header: 'Section' },
      { key: 'admissionNo', header: 'Admission No' },
      { key: 'studentName', header: 'Student' },
      ...TALLY_COLUMNS,
    ],
    rows,
  };
};
