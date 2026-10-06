import { Injectable } from '@nestjs/common';
import type { GuardianRelation } from '../../../../generated/prisma/client';
import {
  parseCnic,
  parseEmail,
  parseEnum,
  parseName,
  parsePhone,
  parseText,
  parseYesNo,
  phoneVariants,
} from '../../validation/fields';
import {
  addError,
  flagDuplicates,
  RowBuilder,
  type ColumnSpec,
  type ParsedRow,
  type SheetRow,
} from '../../validation/sheet';
import type { Db, ImportTarget, KindValidator } from '../kind-handler';
import { RELATIONS } from '../students/student-validator';
import { loadGuardianContext, type GuardianContext } from './guardian-context';

const PHONE =
  'Pakistani mobile: 03001234567, 3001234567, +923001234567 or 00923001234567';

export const GUARDIAN_COLUMNS: ColumnSpec[] = [
  {
    key: 'admissionNo',
    header: 'Admission no',
    required: true,
    format: 'Admission no of a student enrolled in this branch',
    example: 'ESC-2026-0001',
  },
  {
    key: 'name',
    header: 'Name',
    required: true,
    format: 'Full name, letters incl. Urdu (max 100)',
    example: 'Raza Ahmed',
  },
  {
    key: 'relation',
    header: 'Relation',
    required: true,
    format: 'FATHER, MOTHER, GUARDIAN or OTHER',
    example: 'FATHER',
  },
  {
    key: 'phone',
    header: 'Phone',
    required: true,
    format: PHONE,
    example: '03001234567',
  },
  {
    key: 'cnic',
    header: 'CNIC',
    required: false,
    format: '12345-1234567-1 (dashes optional)',
    example: '35202-1234567-1',
  },
  {
    key: 'email',
    header: 'Email',
    required: false,
    format: 'Email address',
    example: '',
  },
  {
    key: 'isPrimary',
    header: 'Primary',
    required: false,
    format: 'yes or no (blank = no); one primary per student',
    example: 'yes',
  },
  {
    key: 'createAccount',
    header: 'Create account',
    required: false,
    format: 'yes or no (blank = no): parent login on the phone/email',
    example: 'no',
  },
];

export interface GuardianImportRow {
  admissionNo?: string;
  name?: string;
  relation?: GuardianRelation;
  phone?: string;
  cnic?: string | null;
  email?: string | null;
  isPrimary?: boolean;
  createAccount?: boolean;
  studentId?: string;
}

@Injectable()
export class GuardianValidator implements KindValidator<
  GuardianImportRow,
  GuardianContext
> {
  readonly kind = 'GUARDIANS' as const;
  readonly columns = GUARDIAN_COLUMNS;
  readonly notes = [
    'A guardian with the same CNIC (or else phone) already in the school is reused; links are created VERIFIED.',
    'New parent logins get a random password that is not shown: the parent signs in with "Forgot password" (code to the phone/email).',
  ];

  parse(source: SheetRow): ParsedRow<GuardianImportRow> {
    const r = new RowBuilder(source, this.columns);
    return r.done({
      admissionNo: r.need('admissionNo', (v) => parseText(v, 40)),
      name: r.need('name', parseName),
      relation: r.need('relation', (v) => parseEnum(v, RELATIONS)),
      phone: r.need('phone', parsePhone),
      cnic: r.maybe('cnic', parseCnic),
      email: r.maybe('email', parseEmail),
      isPrimary: r.maybe('isPrimary', parseYesNo) ?? false,
      createAccount: r.maybe('createAccount', parseYesNo) ?? false,
    });
  }

  loadContext(
    db: Db,
    target: ImportTarget,
    rows: ParsedRow<GuardianImportRow>[],
  ): Promise<GuardianContext> {
    return loadGuardianContext(
      db,
      target,
      rows.map((r) => r.data),
    );
  }

  check(rows: ParsedRow<GuardianImportRow>[], ctx: GuardianContext): void {
    const guardianKey = (d: GuardianImportRow) => d.cnic ?? d.phone;
    flagDuplicates(
      rows,
      (d) =>
        d.admissionNo && guardianKey(d)
          ? `${d.admissionNo}|${guardianKey(d)}`
          : null,
      'Phone',
      'guardian for this student',
    );
    const primaries = new Set<string>();
    for (const row of rows) {
      const d = row.data;
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
      d.studentId = student.id;
      const guardian = ctx.findGuardian(d.cnic ?? null, d.phone ?? null);
      if (guardian && student.guardianIds.has(guardian.id)) {
        addError(
          row,
          'Phone',
          'This guardian is already linked to the student',
        );
      }
      if (d.isPrimary) {
        if (student.hasPrimary || primaries.has(student.id)) {
          addError(
            row,
            'Primary',
            'The student already has a primary guardian',
          );
        }
        primaries.add(student.id);
      }
      if (d.createAccount && !guardian?.userId)
        this.checkAccount(row, ctx, guardian?.id ?? null);
    }
  }

  private checkAccount(
    row: ParsedRow<GuardianImportRow>,
    ctx: GuardianContext,
    guardianId: string | null,
  ): void {
    const d = row.data;
    const users = new Set<string>();
    for (const variant of d.phone ? phoneVariants(d.phone) : []) {
      const id = ctx.usersByPhone.get(variant);
      if (id) users.add(id);
    }
    const byEmail = d.email ? ctx.usersByEmail.get(d.email) : undefined;
    if (byEmail) users.add(byEmail);
    if (users.size > 1) {
      addError(row, 'Email', 'Phone and email belong to different logins');
      return;
    }
    const userId = [...users][0];
    const owner = userId ? ctx.guardianByUser.get(userId) : undefined;
    if (owner && owner !== guardianId) {
      addError(
        row,
        'Create account',
        'That login already belongs to another guardian',
      );
    }
  }
}
