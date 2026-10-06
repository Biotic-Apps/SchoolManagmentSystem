import { Injectable } from '@nestjs/common';
import type { Section, Timetable } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { conflict, invalid } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { NotificationService } from '../../core/notifications/notification.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { assertSessionOpen } from '../academic-sessions/session-lock';
import { SectionAccessService } from '../students/section-access.service';
import {
  findConflicts,
  teachingKey,
  type Conflict,
} from './conflicts/conflict-checker';
import type { SetSlotsDto } from './dto/timetable-input.dto';
import type { TimetableDto } from './dto/timetable.dto';
import { PeriodsService } from './periods/periods.service';
import { TimetablesRepository, type SlotRow } from './timetables.repository';

const toSlot = (row: SlotRow) => ({
  day: row.day,
  periodIndex: row.periodIndex,
  subject: row.subject,
  staff: { id: row.staff.id, name: row.staff.name },
  room: row.room,
});

@Injectable()
export class TimetablesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: TimetablesRepository,
    private readonly sections: SectionAccessService,
    private readonly periods: PeriodsService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  /** Editors see the working draft; everyone else the published version. */
  async get(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
  ): Promise<TimetableDto> {
    const section = await this.sections.read(scope, sectionId);
    const editor =
      user.permissions.has('timetable.edit') &&
      scope.canManageBranch({
        id: section.branchId,
        schoolId: section.schoolId,
      });
    const timetable = await this.repository.find(sectionId, section.sessionId);
    const draft = editor && !!timetable && timetable.status !== 'PUBLISHED';
    const slots = timetable
      ? await this.repository.slots(timetable.id, !draft)
      : [];
    return {
      sectionId,
      sessionId: section.sessionId,
      status: timetable?.status ?? 'DRAFT',
      version: timetable?.version ?? 0,
      publishedAt: timetable?.publishedAt?.toISOString() ?? null,
      slots: slots.map(toSlot),
      periods: await this.periods.forBranch(section.branchId),
    };
  }

  async replaceDraft(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
    dto: SetSlotsDto,
  ) {
    const section = await this.managed(scope, sectionId);
    if (dto.sessionId !== section.sessionId)
      throw invalid('sessionId does not match the section');
    await this.validateSlots(section, dto);
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.timetable.findUnique({
        where: {
          sectionId_sessionId: { sectionId, sessionId: section.sessionId },
        },
      });
      const timetable =
        existing ??
        (await tx.timetable.create({
          data: {
            schoolId: section.schoolId,
            branchId: section.branchId,
            sessionId: section.sessionId,
            sectionId,
          },
        }));
      await tx.timetable.update({
        where: { id: timetable.id },
        data: {
          status:
            timetable.status === 'PUBLISHED'
              ? 'DRAFT_REVISION'
              : timetable.status,
          updatedById: user.id,
        },
      });
      await tx.timetableSlot.deleteMany({
        where: { timetableId: timetable.id, published: false },
      });
      await tx.timetableSlot.createMany({
        data: dto.slots.map((s) => ({
          timetableId: timetable.id,
          published: false,
          day: s.day,
          periodIndex: s.periodIndex,
          subjectId: s.subjectId,
          staffId: s.staffId,
          roomId: s.roomId,
        })),
      });
    });
    this.audit.stage({
      action: 'timetable.draft',
      entityType: 'Section',
      entityId: sectionId,
      schoolId: section.schoolId,
      branchId: section.branchId,
      after: { slots: dto.slots.length },
    });
    return this.get(user, scope, sectionId);
  }

  async check(scope: Scope, sectionId: string): Promise<Conflict[]> {
    const section = await this.managed(scope, sectionId);
    const timetable = await this.repository.find(sectionId, section.sessionId);
    return timetable ? this.conflictsOf(section, timetable) : [];
  }

  async publish(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
  ): Promise<TimetableDto> {
    const section = await this.managed(scope, sectionId);
    const timetable = await this.repository.find(sectionId, section.sessionId);
    if (!timetable || timetable.status === 'PUBLISHED')
      throw conflict('There is no draft to publish');
    const conflicts = await this.conflictsOf(section, timetable);
    if (conflicts.length > 0)
      throw conflict('Timetable has conflicts', { conflicts });

    const drafts = await this.repository.slots(timetable.id, false);
    await this.prisma.$transaction(async (tx) => {
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
    });
    const teachers = drafts
      .map((s) => s.staff.userId)
      .filter((id): id is string => !!id);
    await this.notifications.notify({
      userIds: teachers,
      category: 'TIMETABLE',
      title: 'Timetable published',
      body: 'A timetable you teach in has been published.',
      data: { sectionId },
    });
    this.audit.stage({
      action: 'timetable.publish',
      entityType: 'Section',
      entityId: sectionId,
      schoolId: section.schoolId,
      branchId: section.branchId,
      after: { version: timetable.version + 1, slots: drafts.length },
    });
    return this.get(user, scope, sectionId);
  }

  private async conflictsOf(
    section: Section,
    timetable: Timetable,
  ): Promise<Conflict[]> {
    const [slots, others, teaching, periods, branch] = await Promise.all([
      this.repository.slots(timetable.id, false),
      this.repository.othersPublished(section.sessionId, section.id),
      this.repository.teachingAssignments(section.id),
      this.periods.forBranch(section.branchId),
      this.prisma.branch.findUniqueOrThrow({ where: { id: section.branchId } }),
    ]);
    return findConflicts({
      slots,
      breakPeriods: new Set(
        periods.filter((p) => p.isBreak).map((p) => p.index),
      ),
      workingDays: new Set(branch.workingDays),
      others: others.map((o) => ({ ...o, sectionId: o.timetable.sectionId })),
      teaching: new Set(
        teaching.map((t) =>
          teachingKey(
            t.staffId,
            t.kind === 'CLASS_TEACHER' ? '*' : (t.subjectId ?? ''),
          ),
        ),
      ),
    });
  }

  private async managed(scope: Scope, sectionId: string): Promise<Section> {
    const section = await this.sections.read(scope, sectionId);
    scope.assertManageBranch({
      id: section.branchId,
      schoolId: section.schoolId,
    });
    const session = await this.prisma.academicSession.findUniqueOrThrow({
      where: { id: section.sessionId },
    });
    assertSessionOpen(session);
    return section;
  }

  private async validateSlots(
    section: Section,
    dto: SetSlotsDto,
  ): Promise<void> {
    const keys = new Set(dto.slots.map((s) => `${s.day}:${s.periodIndex}`));
    if (keys.size !== dto.slots.length)
      throw invalid('Two slots share the same day and period');
    const periods = new Set(
      (await this.periods.forBranch(section.branchId)).map((p) => p.index),
    );
    const unknown = dto.slots.find((s) => !periods.has(s.periodIndex));
    if (unknown)
      throw invalid(
        `Period ${unknown.periodIndex} is not in the bell schedule`,
      );
    const ids = (
      pick: (s: SetSlotsDto['slots'][number]) => string | undefined,
    ) => [...new Set(dto.slots.map(pick).filter((v): v is string => !!v))];
    const [subjects, staff, rooms] = await Promise.all([
      this.prisma.subject.count({
        where: {
          id: { in: ids((s) => s.subjectId) },
          schoolId: section.schoolId,
        },
      }),
      this.prisma.staff.count({
        where: {
          id: { in: ids((s) => s.staffId) },
          schoolId: section.schoolId,
        },
      }),
      this.prisma.room.count({
        where: { id: { in: ids((s) => s.roomId) }, branchId: section.branchId },
      }),
    ]);
    if (subjects !== ids((s) => s.subjectId).length)
      throw invalid('Unknown subject in slots');
    if (staff !== ids((s) => s.staffId).length)
      throw invalid('Unknown staff in slots');
    if (rooms !== ids((s) => s.roomId).length)
      throw invalid('Unknown room in slots');
  }
}
