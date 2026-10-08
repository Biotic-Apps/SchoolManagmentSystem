import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { AppError } from '../../../core/common/errors/app-error';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { AllocationService } from '../../staff/allocation/allocation.service';
import type { CellResultDto } from '../dto/timetable-builder.dto';
import type { SetCellDto } from '../dto/timetable-input.dto';
import { TimetableContextService } from '../timetable-context.service';
import { TimetableViewService, toSlot } from '../timetable-view.service';
import { SLOT_INCLUDE, type SlotRow } from '../timetables.repository';
import { CellValidator, type CellInput } from './cell-validator';
import { DraftWriter } from './draft-writer';

interface Cell {
  day: number;
  periodIndex: number;
}

const describe = (slot: SlotRow | null) =>
  slot && {
    subject: slot.subject.name,
    staff: slot.staff.name,
    room: slot.room?.name ?? null,
  };

/** Autosave of one timetable cell into the server draft (contract D6, §5.5). */
@Injectable()
export class TimetableCellsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contexts: TimetableContextService,
    private readonly validator: CellValidator,
    private readonly drafts: DraftWriter,
    private readonly views: TimetableViewService,
    private readonly allocation: AllocationService,
    private readonly audit: AuditService,
  ) {}

  async put(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
    at: Cell,
    dto: SetCellDto,
  ): Promise<CellResultDto> {
    const ctx = await this.contexts.editable(user, scope, sectionId);
    const cell: CellInput = {
      day: at.day,
      periodIndex: at.periodIndex,
      subjectId: dto.subjectId,
      staffId: dto.staffId,
      roomId: dto.roomId ?? null,
    };
    await this.validator.assert(ctx, cell);
    const allocated =
      dto.allocate && ctx.manager
        ? await this.allocate(user, scope, cell, sectionId)
        : false;

    const { before, after } = await this.prisma.$transaction(async (tx) => {
      const timetable = await this.drafts.open(tx, ctx.section, user.id);
      const where = this.cellWhere(timetable.id, at);
      const previous = await tx.timetableSlot.findUnique({
        where,
        include: SLOT_INCLUDE,
      });
      const saved = await tx.timetableSlot.upsert({
        where,
        create: { timetableId: timetable.id, published: false, ...cell },
        update: {
          subjectId: cell.subjectId,
          staffId: cell.staffId,
          roomId: cell.roomId,
        },
        include: SLOT_INCLUDE,
      });
      await this.drafts.settle(tx, timetable);
      return { before: previous, after: saved };
    });
    this.stage('timetable.lesson.update', ctx.section, at, before, after);
    return {
      slot: toSlot(after),
      ...(await this.result(user, scope, sectionId, at, cell.subjectId)),
      allocated,
    };
  }

  /** Idempotent: removing an empty cell just returns the current state. */
  async remove(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
    at: Cell,
  ): Promise<CellResultDto> {
    const ctx = await this.contexts.editable(user, scope, sectionId);
    let removed: SlotRow | null = null;
    if (ctx.timetable) {
      removed = await this.prisma.$transaction(async (tx) => {
        const timetable = await this.drafts.open(tx, ctx.section, user.id);
        const where = this.cellWhere(timetable.id, at);
        const row = await tx.timetableSlot.findUnique({
          where,
          include: SLOT_INCLUDE,
        });
        if (row) await tx.timetableSlot.delete({ where });
        await this.drafts.settle(tx, timetable);
        return row;
      });
    }
    if (removed)
      this.stage('timetable.lesson.remove', ctx.section, at, removed, null);
    return {
      ...(await this.result(user, scope, sectionId, at, removed?.subjectId)),
      allocated: false,
    };
  }

  private async allocate(
    user: AuthUser,
    scope: Scope,
    cell: CellInput,
    sectionId: string,
  ): Promise<boolean> {
    try {
      return await this.allocation.allocateIfFree(
        user,
        scope,
        sectionId,
        cell.subjectId,
        cell.staffId,
      );
    } catch (error) {
      // Own assignment: the lesson is still saved, it just stays unallocated.
      if (error instanceof AppError && error.code === ErrorCode.OWN_ASSIGNMENT)
        return false;
      throw error;
    }
  }

  private async result(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
    at: Cell,
    subjectId?: string,
  ): Promise<Omit<CellResultDto, 'allocated' | 'slot'>> {
    const ctx = await this.contexts.read(user, scope, sectionId);
    const view = await this.views.view(user, ctx);
    const entry = ctx.curriculum.find((cs) => cs.subjectId === subjectId);
    return {
      conflicts: view.conflicts.filter(
        (c) => c.day === at.day && c.periodIndex === at.periodIndex,
      ),
      lesson: subjectId
        ? {
            subjectId,
            placed: view.slots.filter((s) => s.subjectId === subjectId).length,
            periodsPerWeek: entry?.periodsPerWeek ?? null,
          }
        : null,
      state: view.dto.state,
      canPublish: view.dto.canPublish,
      publishBlockedReason: view.dto.publishBlockedReason,
    };
  }

  private cellWhere(timetableId: string, at: Cell) {
    return {
      timetableId_published_day_periodIndex: {
        timetableId,
        published: false,
        day: at.day,
        periodIndex: at.periodIndex,
      },
    };
  }

  private stage(
    action: string,
    section: { id: string; schoolId: string; branchId: string },
    at: Cell,
    before: SlotRow | null,
    after: SlotRow | null,
  ) {
    this.audit.stage({
      action,
      entityType: 'Section',
      entityId: section.id,
      schoolId: section.schoolId,
      branchId: section.branchId,
      before: before && { ...at, ...describe(before) },
      after: after && { ...at, ...describe(after) },
    });
  }
}
