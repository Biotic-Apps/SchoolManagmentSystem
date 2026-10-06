import { Injectable } from '@nestjs/common';
import { parseDate } from '../../../../core/common/dates';
import {
  formatNumber,
  SequenceService,
} from '../../../../core/sequences/sequence.service';
import { EnrollmentWriter } from '../../../students/enrollment/enrollment-writer';
import type { ParsedRow } from '../../validation/sheet';
import type {
  CommitResult,
  Db,
  ImportTarget,
  KindCommitter,
} from '../kind-handler';
import { GuardianLinker } from '../shared/guardian-linker';
import { revertStudents } from './student-revert';
import type { StudentContext, StudentImportRow } from './student-validator';

/** STUDENTS: student + ACTIVE enrollment (+ primary guardian link). */
@Injectable()
export class StudentCommitter implements KindCommitter<
  StudentImportRow,
  StudentContext
> {
  readonly kind = 'STUDENTS' as const;

  constructor(
    private readonly sequences: SequenceService,
    private readonly enrollments: EnrollmentWriter,
    private readonly guardians: GuardianLinker,
  ) {}

  async commit(
    tx: Db,
    target: ImportTarget,
    rows: ParsedRow<StudentImportRow>[],
    ctx: StudentContext,
  ): Promise<CommitResult> {
    const created = {
      students: [] as string[],
      enrollments: [] as string[],
      guardians: [] as string[],
      links: [] as string[],
    };
    const reserved = new Set(
      rows.map((r) => r.data.admissionNo).filter((n): n is string => !!n),
    );
    // Explicit roll numbers first so generated ones never take them.
    const ordered = [...rows].sort(
      (a, b) => Number(!a.data.rollNo) - Number(!b.data.rollNo),
    );
    for (const { data: d } of ordered) {
      const admissionDate = d.admissionDate ?? ctx.today;
      const admissionNo =
        d.admissionNo ??
        (await this.nextAdmissionNo(tx, target, admissionDate, reserved));
      const [firstName, ...rest] = d.name!.split(' ');
      const student = await tx.student.create({
        data: {
          schoolId: target.schoolId,
          admissionNo,
          firstName,
          lastName: rest.join(' '),
          dob: parseDate(d.dob!),
          gender: d.gender!,
          bForm: d.bForm ?? null,
          address: d.address ?? null,
          admissionDate: parseDate(admissionDate),
          createdById: target.actorId,
        },
      });
      created.students.push(student.id);
      const enrollment = await this.enrollments.enroll(tx, {
        studentId: student.id,
        sectionId: d.sectionId!,
        startDate: parseDate(admissionDate),
        actorId: target.actorId,
        rollNo: d.rollNo ?? undefined,
        reason: 'Import',
      });
      created.enrollments.push(enrollment.id);
      if (d.guardian) {
        const linked = await this.guardians.link(tx, target, {
          studentId: student.id,
          guardian: { ...d.guardian, email: null },
          relation: d.guardian.relation,
          isPrimary: true,
        });
        if (linked.guardianCreated) created.guardians.push(linked.guardianId);
        created.links.push(linked.linkId);
      }
    }
    return {
      created,
      reconciliation: { created: rows.length, students: rows.length },
    };
  }

  revert(tx: Db, _target: ImportTarget, created: Record<string, unknown>) {
    return revertStudents(tx, created).then(() => ({}));
  }

  /** Generated like admissions (`{CODE}-{YEAR}-{SEQ}`), skipping taken ones. */
  private async nextAdmissionNo(
    tx: Db,
    target: ImportTarget,
    admissionDate: string,
    reserved: Set<string>,
  ): Promise<string> {
    const year = parseDate(admissionDate).getUTCFullYear();
    for (;;) {
      const seq = await this.sequences.next(
        tx,
        `admission:${target.schoolId}:${year}`,
      );
      const candidate = formatNumber(target.schoolCode, year, seq);
      if (reserved.has(candidate)) continue;
      const taken = await tx.student.count({
        where: { schoolId: target.schoolId, admissionNo: candidate },
      });
      if (taken === 0) return candidate;
    }
  }
}
