import { Injectable } from '@nestjs/common';
import type { Enrollment, Prisma } from '../../../generated/prisma/client';
import { conflict, invalid } from '../../../core/common/errors/errors';
import { assertSessionOpen } from '../../academic-sessions/session-lock';
import { nextRollNo } from './roll-number';

export interface EnrollInput {
  studentId: string;
  sectionId: string;
  startDate: Date;
  actorId: string;
  rollNo?: number;
  reason?: string;
}

export interface Seat {
  section: {
    id: string;
    schoolId: string;
    branchId: string;
    sessionId: string;
  };
  rollNo: number;
}

/**
 * Places students in sections inside a transaction: locks the section row,
 * enforces capacity (409) and hands out the next free roll number.
 */
@Injectable()
export class EnrollmentWriter {
  async reserveSeat(
    tx: Prisma.TransactionClient,
    sectionId: string,
    options: { rollNo?: number; excludeEnrollmentId?: string } = {},
  ): Promise<Seat> {
    await tx.$queryRaw`SELECT "id" FROM "sections" WHERE "id" = ${sectionId}::uuid FOR UPDATE`;
    const section = await tx.section.findUnique({
      where: { id: sectionId },
      include: { session: { select: { status: true } } },
    });
    if (!section || section.status !== 'ACTIVE')
      throw invalid('Section not found or archived');
    assertSessionOpen(section.session);

    const seated = await tx.enrollment.findMany({
      where: {
        sectionId,
        status: 'ACTIVE',
        id: options.excludeEnrollmentId
          ? { not: options.excludeEnrollmentId }
          : undefined,
      },
      select: { rollNo: true },
    });
    if (section.capacity !== null && seated.length >= section.capacity) {
      throw conflict('Section is full', { capacity: section.capacity });
    }
    const taken = seated.map((row) => row.rollNo);
    if (options.rollNo !== undefined && taken.includes(options.rollNo))
      throw conflict(`Roll number ${options.rollNo} is already taken`);
    return {
      section: {
        id: section.id,
        schoolId: section.schoolId,
        branchId: section.branchId,
        sessionId: section.sessionId,
      },
      rollNo: options.rollNo ?? nextRollNo(taken),
    };
  }

  async enroll(
    tx: Prisma.TransactionClient,
    input: EnrollInput,
  ): Promise<Enrollment> {
    const seat = await this.reserveSeat(tx, input.sectionId, {
      rollNo: input.rollNo,
    });
    return tx.enrollment.create({
      data: {
        schoolId: seat.section.schoolId,
        studentId: input.studentId,
        branchId: seat.section.branchId,
        sessionId: seat.section.sessionId,
        sectionId: seat.section.id,
        rollNo: seat.rollNo,
        startDate: input.startDate,
        reason: input.reason,
        createdById: input.actorId,
      },
    });
  }
}
