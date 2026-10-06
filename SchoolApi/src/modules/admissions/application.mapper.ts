import type { DocumentDto } from '../documents/dto/document.dto';
import type { ChildInputDto } from '../students/dto/child-input.dto';
import type { PrimaryGuardianInputDto } from '../students/dto/guardian-input.dto';
import type { MedicalInputDto } from '../students/dto/medical-input.dto';
import type { ApplicationRow } from './applications.repository';
import type { ApplicationDto } from './dto/application.dto';

export const childOf = (row: ApplicationRow) =>
  row.child as unknown as ChildInputDto;
export const guardiansOf = (row: ApplicationRow) =>
  row.guardians as unknown as PrimaryGuardianInputDto[];

export function toApplicationDto(
  row: ApplicationRow,
  documents: DocumentDto[],
): ApplicationDto {
  const test = row.test;
  return {
    id: row.id,
    applicationNo: row.applicationNo,
    branchId: row.branchId,
    sessionId: row.sessionId,
    classId: row.classId,
    className: row.schoolClass.name,
    status: row.status,
    child: childOf(row),
    guardians: guardiansOf(row),
    medical: (row.medical as unknown as MedicalInputDto | null) ?? null,
    notes: row.notes,
    waitlistPosition: row.waitlistPosition,
    test: test && {
      scheduledAt: test.scheduledAt.toISOString(),
      venue: test.venue,
      score: test.score === null ? null : Number(test.score),
      maxScore: test.maxScore === null ? null : Number(test.maxScore),
      remarks: test.remarks,
    },
    documents,
    decisionReason: row.decisionReason,
    studentId: row.studentId,
    createdAt: row.createdAt.toISOString(),
  };
}
