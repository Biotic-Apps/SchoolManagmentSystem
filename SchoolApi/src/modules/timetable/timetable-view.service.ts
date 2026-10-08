import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../../core/common/types/auth-user';
import { ConflictService } from './conflicts/conflict.service';
import { isError, type Conflict } from './conflicts/conflict-types';
import type { TimetableDto } from './dto/timetable.dto';
import { groupSchedule } from './periods/bell-schedule';
import type { SectionContext } from './timetable-context.service';
import { publishGate, stateOf } from './timetable-state';
import { TimetablesRepository, type SlotRow } from './timetables.repository';

export const toSlot = (row: SlotRow) => ({
  day: row.day,
  periodIndex: row.periodIndex,
  subject: row.subject,
  staff: { id: row.staff.id, name: row.staff.name },
  room: row.room,
});

export interface TimetableView {
  dto: TimetableDto;
  /** Whole-draft conflicts (editors with an unpublished draft), else []. */
  conflicts: Conflict[];
  /** Slots the editor works on (draft, or published when nothing changed). */
  slots: SlotRow[];
}

/** GET /timetables: editors see the working draft, everyone else what is published. */
@Injectable()
export class TimetableViewService {
  constructor(
    private readonly repository: TimetablesRepository,
    private readonly conflicts: ConflictService,
  ) {}

  async view(user: AuthUser, ctx: SectionContext): Promise<TimetableView> {
    const { timetable } = ctx;
    const state = stateOf(timetable?.status ?? null);
    const counts = timetable
      ? await this.repository.counts(timetable.id)
      : { draft: 0, published: 0 };
    const drafting = state === 'DRAFT' || state === 'PUBLISHED_WITH_CHANGES';
    const everPublished = (timetable?.version ?? 0) > 0;

    let slots: SlotRow[] = [];
    if (timetable && ctx.editor)
      slots = await this.repository.slots(timetable.id, !drafting);
    else if (timetable && everPublished)
      slots = await this.repository.slots(timetable.id, true);

    const conflicts =
      ctx.editor && drafting ? await this.conflicts.check(ctx, slots) : [];
    const draftSlotCount =
      state === 'PUBLISHED' && counts.draft === 0
        ? counts.published
        : counts.draft;
    const gate = ctx.editor
      ? publishGate({
          state,
          draftSlotCount,
          errorCount: conflicts.filter(isError).length,
          mayPublish: ctx.manager && user.permissions.has('timetable.publish'),
        })
      : { canPublish: false, publishBlockedReason: null };
    const schedule = groupSchedule(ctx.bell);

    const dto: TimetableDto = {
      sectionId: ctx.section.id,
      sessionId: ctx.section.sessionId,
      state: ctx.editor ? state : viewerState(state),
      status: timetable?.status ?? null,
      version: timetable?.version ?? 0,
      publishedAt: timetable?.publishedAt?.toISOString() ?? null,
      draftUpdatedAt:
        drafting && timetable ? timetable.updatedAt.toISOString() : null,
      draftSlotCount: ctx.editor ? draftSlotCount : 0,
      publishedSlotCount: counts.published,
      canEdit: ctx.editor,
      ...gate,
      slots: slots.map(toSlot),
      periods: schedule.default,
      dayPeriods: schedule.days,
      workingDays: ctx.workingDays,
    };
    return { dto, conflicts, slots };
  }
}

/** Viewers never see unpublished changes. */
function viewerState(state: TimetableDto['state']): TimetableDto['state'] {
  return state === 'PUBLISHED_WITH_CHANGES' ? 'PUBLISHED' : state;
}
