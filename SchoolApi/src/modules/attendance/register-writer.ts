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
import {
  checkRegisterAction,
  type RegisterAction,
  type RegisterCheck,
} from './register-state';
import {
  RegistersRepository,
  type RegisterRow,
  type RosterStudent,
} from './registers.repository';

export interface WriteInput {
  section: Section;
  date: Date;
  entries: EntryInputDto[];
  userId: string;
  action: RegisterAction;
  onBehalfOfStaffId: string | null;
  helper: boolean;
  /** The branch lock time passed for this day (see register-lock.ts). */
  pastLock: boolean;
}

export interface WriteResult {
  registerId: string;
  roster: RosterStudent[];
  /**
   * Set when the register was already submitted or locked: only students
   * without a mark (e.g. enrolled after the submit) were added.
   */
  filledStudentIds: string[] | null;
}

/** Writes entries under a row lock after the status machine allows it. */
@Injectable()
export class RegisterWriter {
  constructor(private readonly repository: RegistersRepository) {}

  async save(
    tx: Prisma.TransactionClient,
    input: WriteInput,
  ): Promise<WriteResult> {
    const current = await this.repository.lock(
      tx,
      input.section.id,
      input.date,
    );
    const roster = await this.repository.roster(input.section.id, tx);
    const known = new Set(roster.map((s) => s.studentId));
    const outside = input.entries.filter((e) => !known.has(e.studentId));
    if (outside.length > 0) {
      throw invalid('Students are not enrolled in this section', {
        studentIds: outside.map((e) => e.studentId),
      });
    }
    const check = checkRegisterAction(
      current,
      input.action,
      input.userId,
      input.pastLock,
    );
    if (current && check !== 'OK') {
      const filled = await this.fillUnmarked(tx, current, input, check);
      return { registerId: current.id, roster, filledStudentIds: filled };
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
    return { registerId: register.id, roster, filledStudentIds: null };
  }

  /**
   * A submitted or locked register keeps its marks: changing one needs the
   * submitter (before the lock) or a correction request. Students with no
   * mark yet (enrolled after the submit) may still be marked by anyone who
   * takes the register; unchanged rows sent along are ignored.
   */
  private async fillUnmarked(
    tx: Prisma.TransactionClient,
    current: RegisterRow,
    input: WriteInput,
    check: Exclude<RegisterCheck, 'OK'>,
  ): Promise<string[]> {
    if (input.helper) throw forbidden('Helpers can only edit draft registers');
    const marked = new Map(current.entries.map((e) => [e.studentId, e.status]));
    const changed = input.entries.some(
      (e) => marked.has(e.studentId) && marked.get(e.studentId) !== e.status,
    );
    const added = input.entries.filter((e) => !marked.has(e.studentId));
    if (check === 'PENDING_REVIEW' || changed || added.length === 0)
      this.refuse(check);
    await tx.attendanceEntry.createMany({
      data: added.map((e) => ({
        registerId: current.id,
        studentId: e.studentId,
        status: e.status,
        remark: e.remark ?? null,
      })),
    });
    const lockNow = current.status === 'SUBMITTED' && input.pastLock;
    await tx.attendanceRegister.update({
      where: { id: current.id },
      data: {
        version: { increment: 1 },
        updatedById: input.userId,
        ...(lockNow && { status: 'LOCKED', lockedAt: new Date() }),
      },
    });
    return added.map((e) => e.studentId);
  }

  /**
   * Completes the register (on-leave students default to LEAVE) and submits
   * it. A register submitted after the branch lock time (`lockNow`) is locked
   * straight away, so later changes go through a correction.
   */
  async submit(
    tx: Prisma.TransactionClient,
    registerId: string,
    submitter: { userId: string; onBehalfOfStaffId: string | null },
    onLeave: Set<string>,
    rosterIds: string[],
    lockNow = false,
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
        status: lockNow ? 'LOCKED' : 'SUBMITTED',
        lockedAt: lockNow ? new Date() : null,
        submittedById: submitter.userId,
        submittedAt: new Date(),
        onBehalfOfStaffId: submitter.onBehalfOfStaffId,
        pendingApprovalId: null,
        version: { increment: 1 },
      },
    });
  }

  private refuse(check: Exclude<RegisterCheck, 'OK'>): never {
    switch (check) {
      case 'LOCKED':
        throw recordLocked(
          'Attendance for this day is locked; request a correction',
        );
      case 'PENDING_REVIEW':
        throw conflict('The register is awaiting review');
      case 'ALREADY_SUBMITTED':
        throw new AppError(
          ErrorCode.ALREADY_SUBMITTED,
          'The register was already submitted',
        );
    }
  }
}
