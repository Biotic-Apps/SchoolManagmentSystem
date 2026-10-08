import type {
  Prisma,
  StaffAssignmentKind,
} from '../../../generated/prisma/client';
import { conflict } from '../../../core/common/errors/errors';
import { ASSIGNMENT_INCLUDE } from '../staff.repository';
import { createRoleAssignment } from './assignment-role-sync';

export interface AssignmentWrite {
  staff: { id: string; userId: string | null; schoolId: string };
  kind: StaffAssignmentKind;
  branchId: string;
  sessionId: string;
  sectionId?: string | null;
  subjectId?: string | null;
  responsibleStaffId?: string | null;
  isSubstitute?: boolean;
  validUntil?: Date | null;
  actorId: string;
}

/**
 * Creates a staff assignment with its mirrored role assignment and keeps
 * `section.classTeacherStaffId` in sync (shared by the staff screen and allocation).
 */
export async function writeAssignment(
  tx: Prisma.TransactionClient,
  input: AssignmentWrite,
) {
  const { staff, kind } = input;
  const validUntil = input.validUntil ?? null;
  const roleAssignmentId = staff.userId
    ? await createRoleAssignment(tx, {
        userId: staff.userId,
        kind,
        schoolId: staff.schoolId,
        branchId: input.branchId,
        sectionId: input.sectionId ?? null,
        subjectId: input.subjectId ?? null,
        validUntil,
        grantedById: input.actorId,
      })
    : null;
  const created = await tx.staffAssignment
    .create({
      data: {
        schoolId: staff.schoolId,
        branchId: input.branchId,
        sessionId: input.sessionId,
        staffId: staff.id,
        kind,
        sectionId: input.sectionId ?? undefined,
        subjectId:
          kind === 'SUBJECT_TEACHER'
            ? (input.subjectId ?? undefined)
            : undefined,
        responsibleStaffId:
          kind === 'HELPER'
            ? (input.responsibleStaffId ?? undefined)
            : undefined,
        isSubstitute: input.isSubstitute ?? false,
        validUntil,
        roleAssignmentId,
        createdById: input.actorId,
      },
      include: ASSIGNMENT_INCLUDE,
    })
    .catch((error: { code?: string }) => {
      if (error.code === 'P2002')
        throw conflict(
          kind === 'CLASS_TEACHER'
            ? 'Section already has a class teacher'
            : 'Subject already has a teacher in this section',
        );
      throw error;
    });
  if (kind === 'CLASS_TEACHER' && input.sectionId) {
    await tx.section.update({
      where: { id: input.sectionId },
      data: { classTeacherStaffId: staff.id },
    });
  }
  return created;
}
