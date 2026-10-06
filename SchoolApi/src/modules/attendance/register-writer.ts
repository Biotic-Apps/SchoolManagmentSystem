import { Injectable } from '@nestjs/common';
import type { Prisma, Section } from '../../generated/prisma/client';
import { AppError } from '../../core/common/errors/app-error';
import { ErrorCode } from '../../core/common/errors/error-code.enum';
import {
  conflict,
  forbidden,
  invalid,
  recordLocked,
} from '../../core/common/errors/errors';
import type { EntryInputDto } from './dto/register-input.dto';
import { checkRegisterAction, type RegisterAction } from './register-state';
import { RegistersRepository, type RegisterRow } from './registers.repository';

export interface WriteInput {
  section: Section;
  date: Date;
  entries: EntryInputDto[];
  userId: string;
  action: RegisterAction;
  onBehalfOfStaffId: string | null;
  helper: boolean;
}

/** Writes entries under a row lock after the status machine allows it. */
@Injectable()
export class RegisterWriter {
  constructor(private readonly repository: RegistersRepository) {}

  async save(tx: Prisma.TransactionClient, input: WriteInput) {
    const current = await this.repository.lock(
      tx,
      input.section.id,
      input.date,
    );
    this.assertAllowed(current, input);
    const roster = await this.repository.roster(input.section.id, tx);
    const known = new Set(roster.map((s) => s.studentId));
    const outside = input.entries.filter((e) => !known.has(e.studentId));
    if (outside.length > 0) {
      throw invalid('Students are not enrolled in this section', {
        studentIds: outside.map((e) => e.studentId),
      });
    }
    const register =
      current ??
      (await tx.attendanceRegister.create({
        data: {
          schoolId: input.section.schoolId,
          branchId: input.section.branchId,
          sessionId: input.section.sessionId,
          sectionId: input.section.id,
          date: input.date,
          createdById: input.userId,
        },
      }));
    for (const entry of input.entries) {
      await tx.attendanceEntry.upsert({
        where: {
          registerId_studentId: {
            registerId: register.id,
            studentId: entry.studentId,
          },
        },
        create: {
          registerId: register.id,
          studentId: entry.studentId,
          status: entry.status,
          remark: entry.remark ?? null,
        },
        update: { status: entry.status, remark: entry.remark ?? null },
      });
    }
    await tx.attendanceRegister.update({
      where: { id: register.id },
      data: {
        version: { increment: 1 },
        updatedById: input.userId,
        ...(input.onBehalfOfStaffId && {
          onBehalfOfStaffId: input.onBehalfOfStaffId,
        }),
      },
    });
    return { registerId: register.id, roster };
  }

  /** Completes the register (on-leave students default to LEAVE) and submits it. */
  async submit(
    tx: Prisma.TransactionClient,
    registerId: string,
    submitter: { userId: string; onBehalfOfStaffId: string | null },
    onLeave: Set<string>,
    rosterIds: string[],
  ): Promise<void> {
    const entries = await tx.attendanceEntry.findMany({
      where: { registerId },
      select: { studentId: true },
    });
    const marked = new Set(entries.map((e) => e.studentId));
    const missing = rosterIds.filter((id) => !marked.has(id));
    const unmarked = missing.filter((id) => !onLeave.has(id));
    if (unmarked.length > 0) {
      throw invalid('Mark every student before submitting', {
        studentIds: unmarked,
      });
    }
    if (missing.length > 0) {
      await tx.attendanceEntry.createMany({
        data: missing.map((studentId) => ({
          registerId,
          studentId,
          status: 'LEAVE' as const,
        })),
      });
    }
    await tx.attendanceRegister.update({
      where: { id: registerId },
      data: {
        status: 'SUBMITTED',
        submittedById: submitter.userId,
        submittedAt: new Date(),
        onBehalfOfStaffId: submitter.onBehalfOfStaffId,
        pendingApprovalId: null,
        version: { increment: 1 },
      },
    });
  }

  private assertAllowed(current: RegisterRow | null, input: WriteInput) {
    if (input.helper && current && current.status !== 'DRAFT') {
      throw forbidden('Helpers can only edit draft registers');
    }
    switch (checkRegisterAction(current, input.action, input.userId)) {
      case 'LOCKED':
        throw recordLocked('The register is locked; request a correction');
      case 'PENDING_REVIEW':
        throw conflict('The register is awaiting review');
      case 'ALREADY_SUBMITTED':
        throw new AppError(
          ErrorCode.ALREADY_SUBMITTED,
          'The register was already submitted',
        );
      default:
    }
  }
}
