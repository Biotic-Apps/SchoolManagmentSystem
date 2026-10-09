import type { Prisma } from '../../../generated/prisma/client';
import { OPEN_STATUSES } from '../../finance-core/invoice-state';

export const PRINT_CHALLANS_JOB = 'fees.printChallans';

/** Job input of a bulk challan print. */
export interface PrintChallansInput {
  schoolId: string;
  branchId: string;
  period: string;
  classId: string | null;
  sectionId: string | null;
  requestedById: string;
}

/** Invoices a bulk print covers: issued and still owing (paid ones need no challan). */
export function batchWhere(
  input: Pick<
    PrintChallansInput,
    'branchId' | 'period' | 'classId' | 'sectionId'
  >,
): Prisma.InvoiceWhereInput {
  return {
    branchId: input.branchId,
    period: input.period,
    status: { in: OPEN_STATUSES },
    ...(input.classId ? { classId: input.classId } : {}),
    ...(input.sectionId ? { sectionId: input.sectionId } : {}),
  };
}

export interface BatchRow {
  id: string;
  classOrder: number;
  sectionName: string;
  studentName: string;
}

/** Print order: class level, section, then student name (how teachers hand them out). */
export function sortBatch(rows: BatchRow[]): string[] {
  return [...rows]
    .sort(
      (a, b) =>
        a.classOrder - b.classOrder ||
        a.sectionName.localeCompare(b.sectionName) ||
        a.studentName.localeCompare(b.studentName),
    )
    .map((row) => row.id);
}

/** `challans-MAIN-2026-10.pdf` / `challans-MAIN-2026-10-class-5-a.pdf`. */
export function batchFileName(
  branchCode: string,
  period: string,
  label: string | null,
): string {
  const slug = label
    ? `-${label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`
    : '';
  return `challans-${branchCode}-${period}${slug}.pdf`;
}
