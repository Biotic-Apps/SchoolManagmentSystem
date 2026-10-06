import { Injectable } from '@nestjs/common';
import {
  DESIGNATIONS,
  STAFF_ROLE_KEYS,
  type Designation,
} from '../../../staff/dto/staff-input.dto';
import {
  parseCnic,
  parseDateCell,
  parseEmail,
  parseEnum,
  parseName,
  parsePhone,
  parseYesNo,
  phoneVariants,
} from '../../validation/fields';
import {
  addError,
  flagDuplicates,
  RowBuilder,
  type ParsedRow,
  type SheetRow,
} from '../../validation/sheet';
import type { Db, ImportTarget, KindValidator } from '../kind-handler';
import { sectionKey } from '../shared/academic-refs';
import { parseAssignments, type AssignmentRef } from './assignment-syntax';
import { STAFF_COLUMNS, STAFF_NOTES } from './staff-columns';
import { loadStaffContext, type StaffContext } from './staff-context';

type StaffRoleKey = (typeof STAFF_ROLE_KEYS)[number];

export interface StaffImportRow {
  name?: string;
  designation?: Designation;
  phone?: string;
  email?: string | null;
  cnic?: string;
  joiningDate?: string;
  roleKey?: StaffRoleKey;
  assignments?: AssignmentRef[];
  createAccount?: boolean;
}

/** Role from the designation when it names one, else TEACHER (as /staff). */
export const defaultRole = (designation: string): StaffRoleKey =>
  (STAFF_ROLE_KEYS as readonly string[]).includes(designation)
    ? (designation as StaffRoleKey)
    : 'TEACHER';

@Injectable()
export class StaffValidator implements KindValidator<
  StaffImportRow,
  StaffContext
> {
  readonly kind = 'STAFF' as const;
  readonly columns = STAFF_COLUMNS;
  readonly notes = STAFF_NOTES;

  parse(source: SheetRow): ParsedRow<StaffImportRow> {
    const r = new RowBuilder(source, this.columns);
    const designation = r.need('designation', (v) =>
      parseEnum(v, DESIGNATIONS),
    );
    const roleKey = r.maybe('roleKey', (v) => parseEnum(v, STAFF_ROLE_KEYS));
    return r.done({
      name: r.need('name', parseName),
      designation,
      phone: r.need('phone', parsePhone),
      email: r.maybe('email', parseEmail),
      cnic: r.need('cnic', parseCnic),
      joiningDate: r.need('joiningDate', parseDateCell),
      roleKey: roleKey ?? (designation ? defaultRole(designation) : undefined),
      assignments: r.maybe('assignments', parseAssignments) ?? [],
      createAccount: r.maybe('createAccount', parseYesNo) ?? false,
    });
  }

  loadContext(
    db: Db,
    target: ImportTarget,
    rows: ParsedRow<StaffImportRow>[],
  ): Promise<StaffContext> {
    return loadStaffContext(
      db,
      target,
      rows.map((r) => r.data),
    );
  }

  check(rows: ParsedRow<StaffImportRow>[], ctx: StaffContext): void {
    flagDuplicates(rows, (d) => d.cnic, 'CNIC', 'CNIC');
    flagDuplicates(rows, (d) => d.phone, 'Phone', 'phone');
    flagDuplicates(rows, (d) => d.email, 'Email', 'email');
    const classTeachers = new Set(ctx.classTeacherSections);
    const subjectTeachers = new Set(ctx.subjectTeachers);
    for (const row of rows) {
      const d = row.data;
      if (d.cnic && ctx.staffCnics.has(d.cnic.replace(/-/g, ''))) {
        addError(row, 'CNIC', 'A staff member with this CNIC already exists');
      }
      if (
        d.phone &&
        phoneVariants(d.phone).some((p) => ctx.staffPhones.has(p))
      ) {
        addError(row, 'Phone', 'A staff member with this phone already exists');
      }
      if (d.createAccount) this.checkAccount(row, ctx);
      for (const a of d.assignments ?? []) {
        const label = `${a.classRef}-${a.section}`;
        const section = ctx.refs.sections.get(
          sectionKey(a.classRef, a.section),
        );
        if (!section) {
          addError(row, 'Assignments', `No section "${label}" in this session`);
          continue;
        }
        a.sectionId = section.id;
        if (a.kind === 'CLASS_TEACHER') {
          if (classTeachers.has(section.id)) {
            addError(
              row,
              'Assignments',
              `${section.label} already has a class teacher`,
            );
          }
          classTeachers.add(section.id);
          continue;
        }
        const subjectId = ctx.subjects.get(a.subjectCode ?? '');
        if (!subjectId) {
          addError(
            row,
            'Assignments',
            `Unknown subject code "${a.subjectCode}"`,
          );
          continue;
        }
        a.subjectId = subjectId;
        if (!ctx.classSubjects.has(`${section.classId}|${subjectId}`)) {
          addError(
            row,
            'Assignments',
            `${a.subjectCode} is not taught in ${section.label}`,
          );
        } else if (subjectTeachers.has(`${section.id}|${subjectId}`)) {
          addError(
            row,
            'Assignments',
            `${a.subjectCode} in ${section.label} already has a teacher`,
          );
        }
        subjectTeachers.add(`${section.id}|${subjectId}`);
      }
    }
  }

  private checkAccount(
    row: ParsedRow<StaffImportRow>,
    ctx: StaffContext,
  ): void {
    const d = row.data;
    const found = [
      ...(d.phone
        ? phoneVariants(d.phone).map((p) => ctx.usersByPhone.get(p))
        : []),
      d.email ? ctx.usersByEmail.get(d.email) : undefined,
    ].filter((u) => u !== undefined);
    if (new Set(found.map((u) => u.id)).size > 1) {
      addError(row, 'Email', 'Phone and email belong to different logins');
    } else if (found[0]?.hasStaff) {
      addError(row, 'Create account', 'That login already has a staff record');
    }
  }
}
