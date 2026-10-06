import { Injectable } from '@nestjs/common';
import { schoolDate } from '../../../../core/common/school-time';
import { parseAmount, parseDateCell, parseText } from '../../validation/fields';
import {
  addError,
  flagDuplicates,
  RowBuilder,
  type ColumnSpec,
  type ParsedRow,
  type SheetRow,
} from '../../validation/sheet';
import type { Db, ImportTarget, KindValidator } from '../kind-handler';

export const OPENING_COLUMNS: ColumnSpec[] = [
  {
    key: 'admissionNo',
    header: 'Admission no',
    required: true,
    format: 'Admission no of a student enrolled in this branch',
    example: 'ESC-2026-0001',
  },
  {
    key: 'amount',
    header: 'Amount',
    required: true,
    format:
      'Rupees owed, up to 2 decimals, greater than 0 (advance credit: record a payment instead)',
    example: '12500.00',
  },
  {
    key: 'asOfDate',
    header: 'As of date',
    required: true,
    format: 'YYYY-MM-DD or DD/MM/YYYY (not in the future)',
    example: '2026-03-31',
  },
];

export interface OpeningImportRow {
  admissionNo?: string;
  amountMinor?: number;
  asOfDate?: string;
  studentId?: string;
  sectionId?: string | null;
  classId?: string | null;
}

export interface OpeningContext {
  students: Map<
    string,
    { id: string; sectionId: string | null; classId: string | null }
  >;
  /** students that already have an opening-balance invoice */
  withOpening: Set<string>;
  today: string;
}

@Injectable()
export class OpeningValidator implements KindValidator<
  OpeningImportRow,
  OpeningContext
> {
  readonly kind = 'OPENING_BALANCES' as const;
  readonly columns = OPENING_COLUMNS;
  readonly notes = [
    'One row per student. Each row becomes an issued invoice "Opening balance" due on the as-of date and a ledger charge (OPENING_BALANCE).',
    'An existing advance credit of the student is spent on the new invoice, as when any invoice is issued.',
    'After commit the reconciliation compares the file total with the total charged to the ledger.',
  ];

  parse(source: SheetRow): ParsedRow<OpeningImportRow> {
    const r = new RowBuilder(source, this.columns);
    return r.done({
      admissionNo: r.need('admissionNo', (v) => parseText(v, 40)),
      amountMinor: r.need('amount', parseAmount),
      asOfDate: r.need('asOfDate', parseDateCell),
    });
  }

  async loadContext(
    db: Db,
    target: ImportTarget,
    rows: ParsedRow<OpeningImportRow>[],
  ): Promise<OpeningContext> {
    const admissionNos = rows.flatMap((r) => r.data.admissionNo ?? []);
    const students = await db.student.findMany({
      where: {
        schoolId: target.schoolId,
        admissionNo: { in: admissionNos },
        enrollments: { some: { branchId: target.branchId, status: 'ACTIVE' } },
      },
      select: {
        id: true,
        admissionNo: true,
        enrollments: {
          where: { sessionId: target.sessionId, status: 'ACTIVE' },
          select: { sectionId: true, section: { select: { classId: true } } },
        },
      },
    });
    const opening = await db.invoice.findMany({
      where: {
        studentId: { in: students.map((s) => s.id) },
        source: 'OPENING',
        status: { not: 'CANCELLED' },
      },
      select: { studentId: true },
    });
    return {
      students: new Map(
        students.map((s) => [
          s.admissionNo,
          {
            id: s.id,
            sectionId: s.enrollments[0]?.sectionId ?? null,
            classId: s.enrollments[0]?.section.classId ?? null,
          },
        ]),
      ),
      withOpening: new Set(opening.map((i) => i.studentId)),
      today: schoolDate(),
    };
  }

  check(rows: ParsedRow<OpeningImportRow>[], ctx: OpeningContext): void {
    flagDuplicates(
      rows,
      (d) => d.admissionNo,
      'Admission no',
      'student (one opening balance per student)',
    );
    for (const row of rows) {
      const d = row.data;
      if (d.asOfDate && d.asOfDate > ctx.today) {
        addError(row, 'As of date', 'As-of date is in the future');
      }
      if (!d.admissionNo) continue;
      const student = ctx.students.get(d.admissionNo);
      if (!student) {
        addError(
          row,
          'Admission no',
          'No student with this admission no in this branch',
        );
        continue;
      }
      Object.assign(d, {
        studentId: student.id,
        sectionId: student.sectionId,
        classId: student.classId,
      });
      if (ctx.withOpening.has(student.id)) {
        addError(
          row,
          'Admission no',
          'The student already has an opening balance',
        );
      }
    }
  }
}
