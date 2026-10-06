import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { parseDate } from '../../../core/common/dates';
import { OutboxService } from '../../../core/outbox/outbox.service';
import {
  formatNumber,
  SequenceService,
} from '../../../core/sequences/sequence.service';
import type { ChildInputDto } from '../dto/child-input.dto';
import type { PrimaryGuardianInputDto } from '../dto/guardian-input.dto';
import type { MedicalInputDto } from '../dto/medical-input.dto';
import { EnrollmentWriter } from '../enrollment/enrollment-writer';
import { queueIdCard } from '../id-card/id-card-job';
import { GuardianWriter } from './guardian-writer';

export interface RegistrationInput {
  schoolId: string;
  schoolCode: string;
  sectionId: string;
  admissionDate: string;
  child: ChildInputDto;
  guardians: PrimaryGuardianInputDto[];
  medical?: MedicalInputDto | null;
  actorId: string;
}

export interface Registered {
  studentId: string;
  admissionNo: string;
  enrollmentId: string;
  /** Publish after commit. */
  outboxIds: string[];
  /** Guardian accounts whose access cache must be refreshed after commit. */
  guardianUserIds: string[];
}

/**
 * One transaction for admission confirm and direct registration: student,
 * guardians + VERIFIED links, enrollment with roll number, admission number,
 * and the first ID card (rendered by a job after commit).
 */
@Injectable()
export class StudentRegistrationService {
  constructor(
    private readonly sequences: SequenceService,
    private readonly enrollments: EnrollmentWriter,
    private readonly guardians: GuardianWriter,
    private readonly outbox: OutboxService,
  ) {}

  async register(
    tx: Prisma.TransactionClient,
    input: RegistrationInput,
  ): Promise<Registered> {
    const admissionDate = parseDate(input.admissionDate);
    const year = admissionDate.getUTCFullYear();
    const seq = await this.sequences.next(
      tx,
      `admission:${input.schoolId}:${year}`,
    );
    const admissionNo = formatNumber(input.schoolCode, year, seq);
    const child = input.child;
    const student = await tx.student.create({
      data: {
        schoolId: input.schoolId,
        admissionNo,
        firstName: child.firstName.trim(),
        lastName: child.lastName.trim(),
        dob: parseDate(child.dob),
        gender: child.gender,
        bForm: child.bForm,
        photoFileId: child.photoFileId,
        address: child.address,
        admissionDate,
        createdById: input.actorId,
      },
    });
    if (input.medical) {
      await tx.studentHealthProfile.create({
        data: {
          studentId: student.id,
          ...input.medical,
          updatedById: input.actorId,
        },
      });
    }
    const guardianUserIds = await this.guardians.attachVerified(tx, {
      schoolId: input.schoolId,
      studentId: student.id,
      guardians: input.guardians,
      actorId: input.actorId,
    });
    const enrollment = await this.enrollments.enroll(tx, {
      studentId: student.id,
      sectionId: input.sectionId,
      startDate: admissionDate,
      actorId: input.actorId,
      reason: 'Admission',
    });
    const card = await queueIdCard(tx, this.outbox, {
      schoolId: input.schoolId,
      studentId: student.id,
      requestedById: input.actorId,
    });
    return {
      studentId: student.id,
      admissionNo,
      enrollmentId: enrollment.id,
      outboxIds: [card.outboxId],
      guardianUserIds,
    };
  }
}
