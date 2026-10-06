import { Injectable } from '@nestjs/common';
import type {
  Gender,
  GuardianRelation,
} from '../../../../generated/prisma/client';
import { schoolDate } from '../../../../core/common/school-time';
import {
  parseCnic,
  parseDateCell,
  parseEnum,
  parseInteger,
  parseName,
  parsePhone,
  parseText,
} from '../../validation/fields';
import {
  addError,
  flagDuplicates,
  isValid,
  RowBuilder,
  type ParsedRow,
  type SheetRow,
} from '../../validation/sheet';
import type { Db, ImportTarget, KindValidator } from '../kind-handler';
import {
  loadAcademicRefs,
  sectionKey,
  type AcademicRefs,
} from '../shared/academic-refs';
import { STUDENT_COLUMNS, STUDENT_NOTES } from './student-columns';

export const GENDERS: Gender[] = ['MALE', 'FEMALE', 'OTHER'];
export const RELATIONS: GuardianRelation[] = [
  'FATHER',
  'MOTHER',
  'GUARDIAN',
  'OTHER',
];

export interface StudentImportRow {
  name?: string;
  gender?: Gender;
  dob?: string;
  className?: string;
  sectionName?: string;
  sectionId?: string;
  rollNo?: number | null;
  admissionNo?: string | null;
  admissionDate?: string;
  bForm?: string | null;
  address?: string | null;
  guardian?: {
    name: string;
    relation: GuardianRelation;
    phone: string;
    cnic: string | null;
  } | null;
}

export interface StudentContext {
  refs: AcademicRefs;
  takenAdmissionNos: Set<string>;
  today: string;
}

@Injectable()
export class StudentValidator implements KindValidator<
  StudentImportRow,
  StudentContext
> {
  readonly kind = 'STUDENTS' as const;
  readonly columns = STUDENT_COLUMNS;
  readonly notes = STUDENT_NOTES;

  parse(source: SheetRow): ParsedRow<StudentImportRow> {
    const r = new RowBuilder(source, this.columns);
    const fatherName = r.maybe('fatherName', parseName);
    const phone = r.maybe('guardianPhone', parsePhone);
    const relation = r.maybe('guardianRelation', (v) =>
      parseEnum(v, RELATIONS),
    );
    const cnic = r.maybe('guardianCnic', parseCnic);
    if (fatherName && phone === null) {
      r.error('guardianPhone', 'Required when a father/guardian name is given');
    }
    if (phone && fatherName === null) {
      r.error('fatherName', 'Required when a guardian phone is given');
    }
    const data: StudentImportRow = {
      name: r.need('name', parseName),
      gender: r.need('gender', (v) =>
        parseEnum(v, GENDERS, {
          M: 'MALE',
          F: 'FEMALE',
          BOY: 'MALE',
          GIRL: 'FEMALE',
        }),
      ),
      dob: r.need('dob', parseDateCell),
      className: r.need('class', (v) => parseText(v, 50)),
      sectionName: r.need('section', (v) => parseText(v, 20)),
      rollNo: r.maybe('rollNo', (v) => parseInteger(v, 1, 9999)),
      admissionNo: r.maybe('admissionNo', (v) => parseText(v, 40)),
      admissionDate: r.maybe('admissionDate', parseDateCell) ?? undefined,
      bForm: r.maybe('bForm', parseCnic),
      address: r.maybe('address', (v) => parseText(v, 300)),
      guardian:
        fatherName && phone
          ? {
              name: fatherName,
              phone,
              relation: relation ?? 'FATHER',
              cnic: cnic ?? null,
            }
          : null,
    };
    return r.done(data);
  }

  async loadContext(
    db: Db,
    target: ImportTarget,
    rows: ParsedRow<StudentImportRow>[],
  ): Promise<StudentContext> {
    const given = rows
      .map((row) => row.data.admissionNo)
      .filter((n): n is string => !!n);
    const [refs, taken] = await Promise.all([
      loadAcademicRefs(db, target.schoolId, target.sessionId),
      given.length
        ? db.student.findMany({
            where: { schoolId: target.schoolId, admissionNo: { in: given } },
            select: { admissionNo: true },
          })
        : [],
    ]);
    return {
      refs,
      takenAdmissionNos: new Set(taken.map((s) => s.admissionNo)),
      today: schoolDate(),
    };
  }

  check(rows: ParsedRow<StudentImportRow>[], ctx: StudentContext): void {
    flagDuplicates(
      rows,
      (d) => d.admissionNo?.toLowerCase(),
      'Admission no',
      'admission no',
    );
    flagDuplicates(
      rows,
      (d) => (d.name && d.dob ? `${d.name.toLowerCase()}|${d.dob}` : null),
      'Name',
      'student (same name and date of birth)',
    );
    const seats = new Map<string, number>();
    const rolls = new Map<string, Set<number>>();
    for (const row of rows) {
      const d = row.data;
      if (d.admissionNo && ctx.takenAdmissionNos.has(d.admissionNo)) {
        addError(
          row,
          'Admission no',
          'Admission no already exists in the school',
        );
      }
      if (d.dob && d.dob > ctx.today)
        addError(row, 'Date of birth', 'Date of birth is in the future');
      if (d.admissionDate && d.admissionDate > ctx.today) {
        addError(row, 'Admission date', 'Admission date is in the future');
      }
      if (!d.className || !d.sectionName) continue;
      const key = sectionKey(d.className, d.sectionName);
      const section = ctx.refs.sections.get(key);
      if (!section) {
        addError(
          row,
          'Section',
          `No section "${d.className}-${d.sectionName}" in this session`,
        );
        continue;
      }
      d.sectionId = section.id;
      if (!isValid(row)) continue;
      const used = seats.get(key) ?? section.active;
      if (section.capacity !== null && used >= section.capacity) {
        addError(
          row,
          'Section',
          `Section ${section.label} is full (capacity ${section.capacity})`,
        );
        continue;
      }
      seats.set(key, used + 1);
      if (d.rollNo) {
        const inFile = rolls.get(key) ?? new Set<number>();
        if (section.rollNos.has(d.rollNo) || inFile.has(d.rollNo)) {
          addError(
            row,
            'Roll no',
            `Roll no ${d.rollNo} is already taken in ${section.label}`,
          );
        }
        inFile.add(d.rollNo);
        rolls.set(key, inFile);
      }
    }
  }
}
