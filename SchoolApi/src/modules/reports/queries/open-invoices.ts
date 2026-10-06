import type { PrismaService } from '../../../core/prisma/prisma.service';
import { OPEN_STATUSES, balanceOf } from '../../finance-core/invoice-state';
import { fullName } from '../../students/student.mapper';
import type { OpenBalance } from './aging-buckets';

export interface StudentLabel {
  admissionNo: string;
  name: string;
  className: string | null;
}

/** Unpaid balances of open invoices in a branch. */
export async function openBalances(
  prisma: PrismaService,
  branchId: string,
): Promise<OpenBalance[]> {
  const invoices = await prisma.invoice.findMany({
    where: { branchId, status: { in: OPEN_STATUSES } },
    select: {
      studentId: true,
      dueDate: true,
      totalMinor: true,
      paidMinor: true,
    },
  });
  return invoices.map((i) => ({
    studentId: i.studentId,
    dueDate: i.dueDate,
    balanceMinor: balanceOf(i),
  }));
}

/** Name, admission no and current class of each student. */
export async function studentLabels(
  prisma: PrismaService,
  studentIds: string[],
): Promise<Map<string, StudentLabel>> {
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      admissionNo: true,
      enrollments: {
        orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
        take: 1,
        select: {
          section: {
            select: { name: true, schoolClass: { select: { name: true } } },
          },
        },
      },
    },
  });
  return new Map(
    students.map((s) => {
      const section = s.enrollments[0]?.section;
      return [
        s.id,
        {
          admissionNo: s.admissionNo,
          name: fullName(s),
          className: section
            ? `${section.schoolClass.name} ${section.name}`
            : null,
        },
      ];
    }),
  );
}
