import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import { domainError } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ConflictService } from '../conflicts/conflict.service';
import { isError } from '../conflicts/conflict-types';
import type { TimetableDto } from '../dto/timetable.dto';
import { TimetableContextService } from '../timetable-context.service';
import { TimetableViewService } from '../timetable-view.service';
import { TimetablesRepository, type SlotRow } from '../timetables.repository';
import { DraftWriter } from './draft-writer';

const TX_OPTIONS = { timeout: 20_000, maxWait: 10_000 };

/** Users whose own lessons differ between two versions of the week. */
function changedTeachers(before: SlotRow[], after: SlotRow[]): string[] {
  const lessons = (rows: SlotRow[]) => {
    const map = new Map<string, Set<string>>();
    for (const s of rows) {
      if (!s.staff.userId) continue;
      if (!map.has(s.staff.userId)) map.set(s.staff.userId, new Set());
      map
        .get(s.staff.userId)!
        .add(`${s.day}:${s.periodIndex}:${s.subjectId}:${s.roomId ?? ''}`);
    }
    return map;
  };
  const a = lessons(before);
  const b = lessons(after);
  return [...new Set([...a.keys(), ...b.keys()])].filter((userId) => {
    const x = a.get(userId) ?? new Set<string>();
    const y = b.get(userId) ?? new Set<string>();
    return x.size !== y.size || [...x].some((k) => !y.has(k));
  });
}

/** Publish / discard (contract §5.5); publishing is serialised per session. */
@Injectable()
export class TimetablePublisherService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contexts: TimetableContextService,
    private readonly repository: TimetablesRepository,
    private readonly conflicts: ConflictService,
    private readonly drafts: DraftWriter,
    private readonly views: TimetableViewService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async publish(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
  ): Promise<TimetableDto> {
    const ctx = await this.contexts.managed(user, scope, sectionId);
    const timetable = ctx.timetable;
    if (!timetable)
      throw domainError(ErrorCode.NOTHING_TO_PUBLISH, 'Add lessons first');
    if (timetable.status === 'PUBLISHED')
      throw domainError(
        ErrorCode.NOTHING_TO_PUBLISH,
        'No changes since the last publish',
      );

    const { before, drafts } = await this.prisma.$transaction(async (tx) => {
      // Two sections of a session can't publish a teacher clash at the same time.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${ctx.section.sessionId}))`;
      const drafts = await this.repository.slots(timetable.id, false, tx);
      if (drafts.length === 0)
        throw domainError(ErrorCode.NOTHING_TO_PUBLISH, 'Add lessons first');
      const errors = (await this.conflicts.check(ctx, drafts)).filter(isError);
      if (errors.length > 0)
        throw domainError(
          ErrorCode.TIMETABLE_CONFLICTS,
          `Fix ${errors.length} conflict${errors.length === 1 ? '' : 's'} first`,
          errors,
        );
      const before = await this.repository.slots(timetable.id, true, tx);
      await tx.timetableSlot.deleteMany({
        where: { timetableId: timetable.id, published: true },
      });
      await tx.timetableSlot.createMany({
        data: drafts.map((s) => ({
          timetableId: timetable.id,
          published: true,
          day: s.day,
          periodIndex: s.periodIndex,
          subjectId: s.subjectId,
          staffId: s.staffId,
          roomId: s.roomId,
        })),
      });
      await tx.timetable.update({
        where: { id: timetable.id },
        data: {
          status: 'PUBLISHED',
          version: { increment: 1 },
          publishedAt: new Date(),
          publishedById: user.id,
        },
      });
      return { before, drafts };
    }, TX_OPTIONS);

    const changed = changedTeachers(before, drafts);
    if (changed.length > 0)
      await this.notifications.notify({
        userIds: changed,
        category: 'TIMETABLE',
        title: 'Timetable published',
        body: `Your lessons in ${ctx.className} ${ctx.section.name} have changed.`,
        data: { sectionId },
      });
    this.audit.stage({
      action: 'timetable.publish',
      entityType: 'Section',
      entityId: sectionId,
      schoolId: ctx.section.schoolId,
      branchId: ctx.section.branchId,
      after: { version: timetable.version + 1, lessons: drafts.length },
    });
    return this.current(user, scope, sectionId);
  }

  async discard(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
  ): Promise<TimetableDto> {
    const ctx = await this.contexts.managed(user, scope, sectionId);
    const timetable = ctx.timetable;
    if (!timetable || timetable.status === 'PUBLISHED')
      throw domainError(
        ErrorCode.NOTHING_TO_DISCARD,
        'There are no unpublished changes',
      );
    const drafts = await this.repository.slots(timetable.id, false);
    await this.prisma.$transaction(async (tx) => {
      if (timetable.version === 0) {
        await tx.timetable.delete({ where: { id: timetable.id } });
        return;
      }
      await this.drafts.resetDraft(tx, timetable.id);
      await tx.timetable.update({
        where: { id: timetable.id },
        data: { status: 'PUBLISHED', updatedById: user.id },
      });
    });
    this.audit.stage({
      action: 'timetable.discard',
      entityType: 'Section',
      entityId: sectionId,
      schoolId: ctx.section.schoolId,
      branchId: ctx.section.branchId,
      before: { lessons: drafts.length },
      after: { version: timetable.version },
    });
    return this.current(user, scope, sectionId);
  }

  private async current(user: AuthUser, scope: Scope, sectionId: string) {
    const ctx = await this.contexts.read(user, scope, sectionId);
    return (await this.views.view(user, ctx)).dto;
  }
}
