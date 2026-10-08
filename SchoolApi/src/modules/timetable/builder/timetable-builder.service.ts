import { Injectable } from '@nestjs/common';
import { forbiddenScope } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ConflictService } from '../conflicts/conflict.service';
import type { BusySlot } from '../conflicts/conflict-types';
import type {
  BusyDto,
  TimetableBuilderDto,
} from '../dto/timetable-builder.dto';
import { TimetableContextService } from '../timetable-context.service';
import { TimetableViewService } from '../timetable-view.service';
import { TimetablesRepository } from '../timetables.repository';

const cellKey = (s: BusySlot) =>
  `${s.sectionId}@${s.day}:${s.periodIndex}:${s.staffId}:${s.roomId ?? ''}`;

/** Other sections' lessons per teacher and room, so the dialog warns instantly. */
function busyOf(published: BusySlot[], drafts: BusySlot[]): BusyDto[] {
  const live = new Set(published.map(cellKey));
  const rows = [
    ...published.map((s) => ({ s, published: true })),
    ...drafts
      .filter((s) => !live.has(cellKey(s)))
      .map((s) => ({ s, published: false })),
  ];
  return rows.flatMap(({ s, published }) => {
    const base = {
      day: s.day,
      periodIndex: s.periodIndex,
      sectionId: s.sectionId,
      sectionName: s.sectionName ?? '',
      published,
    };
    const staff: BusyDto = { staffId: s.staffId, ...base };
    return s.roomId ? [staff, { roomId: s.roomId, ...base }] : [staff];
  });
}

/** GET /timetables/:sectionId/builder: everything the builder screen needs in one call. */
@Injectable()
export class TimetableBuilderService {
  constructor(
    private readonly contexts: TimetableContextService,
    private readonly views: TimetableViewService,
    private readonly repository: TimetablesRepository,
    private readonly conflicts: ConflictService,
  ) {}

  async builder(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
  ): Promise<TimetableBuilderDto> {
    const ctx = await this.contexts.read(user, scope, sectionId);
    if (!ctx.editor) throw forbiddenScope();
    const { section } = ctx;
    const [view, teaching, rooms, others, maxPeriodsPerDay] = await Promise.all(
      [
        this.views.view(user, ctx),
        this.repository.teachingAssignments(section.id),
        this.repository.rooms(section.branchId),
        this.repository.others(section.sessionId, section.id),
        this.conflicts.maxPeriodsPerDay(section.branchId),
      ],
    );
    const teacherOf = (subjectId: string) =>
      teaching.find(
        (t) =>
          t.kind === 'SUBJECT_TEACHER' &&
          !t.isSubstitute &&
          t.subjectId === subjectId,
      )?.staff ?? null;

    return {
      timetable: view.dto,
      section: {
        id: section.id,
        name: section.name,
        group: section.group,
        class: { id: section.classId, name: ctx.className },
        branchId: section.branchId,
      },
      lessons: ctx.curriculum.map((cs) => ({
        subject: { id: cs.subject.id, name: cs.subject.name },
        periodsPerWeek: cs.periodsPerWeek,
        placed: view.slots.filter((s) => s.subjectId === cs.subjectId).length,
        teacher: teacherOf(cs.subjectId),
      })),
      rooms,
      busy: busyOf(others.published, others.drafts),
      conflicts: view.conflicts,
      maxPeriodsPerDay,
    };
  }
}
