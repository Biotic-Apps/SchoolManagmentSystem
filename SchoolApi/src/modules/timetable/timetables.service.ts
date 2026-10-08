import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { invalid } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { ConflictService } from './conflicts/conflict.service';
import type { Conflict } from './conflicts/conflict-types';
import { CellValidator } from './drafts/cell-validator';
import { DraftWriter } from './drafts/draft-writer';
import type { SetSlotsDto } from './dto/timetable-input.dto';
import type { TimetableDto } from './dto/timetable.dto';
import { TimetableContextService } from './timetable-context.service';
import { TimetableViewService } from './timetable-view.service';
import { TimetablesRepository } from './timetables.repository';

/** Section timetable read, bulk draft replace (auto-fill / old clients) and check. */
@Injectable()
export class TimetablesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: TimetablesRepository,
    private readonly contexts: TimetableContextService,
    private readonly views: TimetableViewService,
    private readonly validator: CellValidator,
    private readonly drafts: DraftWriter,
    private readonly conflicts: ConflictService,
    private readonly audit: AuditService,
  ) {}

  /** Editors see the working draft; everyone else the published version. */
  async get(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
  ): Promise<TimetableDto> {
    const ctx = await this.contexts.read(user, scope, sectionId);
    return (await this.views.view(user, ctx)).dto;
  }

  async replaceDraft(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
    dto: SetSlotsDto,
  ): Promise<TimetableDto> {
    const ctx = await this.contexts.editable(user, scope, sectionId);
    if (dto.sessionId !== ctx.section.sessionId)
      throw invalid('sessionId does not match the section');
    const keys = new Set(dto.slots.map((s) => `${s.day}:${s.periodIndex}`));
    if (keys.size !== dto.slots.length)
      throw invalid('Two slots share the same day and period');
    const cells = dto.slots.map((s) => ({ ...s, roomId: s.roomId ?? null }));
    await this.validator.assertMany(ctx, cells);

    await this.prisma.$transaction(async (tx) => {
      const timetable = await this.drafts.open(tx, ctx.section, user.id);
      await tx.timetableSlot.deleteMany({
        where: { timetableId: timetable.id, published: false },
      });
      await tx.timetableSlot.createMany({
        data: cells.map((s) => ({
          timetableId: timetable.id,
          published: false,
          ...s,
        })),
      });
      await this.drafts.settle(tx, timetable);
    });
    this.audit.stage({
      action: 'timetable.draft.replace',
      entityType: 'Section',
      entityId: sectionId,
      schoolId: ctx.section.schoolId,
      branchId: ctx.section.branchId,
      after: { lessons: dto.slots.length },
    });
    return this.get(user, scope, sectionId);
  }

  /** Whole-draft conflicts with severities. */
  async check(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
  ): Promise<Conflict[]> {
    const ctx = await this.contexts.editable(user, scope, sectionId);
    if (!ctx.timetable) return [];
    const drafting = ctx.timetable.status !== 'PUBLISHED';
    const slots = await this.repository.slots(ctx.timetable.id, !drafting);
    return this.conflicts.check(ctx, slots);
  }
}
