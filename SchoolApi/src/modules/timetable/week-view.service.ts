import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import {
  forbiddenScope,
  invalid,
  notFound,
} from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { isoWeekday, weekDates } from '../../core/common/week';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { SectionAccessService } from '../students/section-access.service';
import type { TeacherSlotDto } from './dto/timetable.dto';
import { periodsForDay } from './periods/bell-schedule';

const SLOT_INCLUDE = {
  subject: { select: { id: true, name: true } },
  staff: { select: { id: true, name: true } },
  room: { select: { id: true, name: true } },
  timetable: {
    select: {
      branchId: true,
      section: {
        select: {
          id: true,
          name: true,
          schoolClass: { select: { name: true } },
        },
      },
    },
  },
} satisfies Prisma.TimetableSlotInclude;

type WeekSlot = Prisma.TimetableSlotGetPayload<{
  include: typeof SLOT_INCLUDE;
}>;

/** Published week views with the day's substitutions applied. */
@Injectable()
export class WeekViewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SectionAccessService,
  ) {}

  async forTeacher(
    user: AuthUser,
    scope: Scope,
    staffId: string,
    weekOf?: string,
  ) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
    });
    if (!staff) throw notFound('Staff');
    const own = staff.userId === user.id;
    if (
      !own &&
      (scope.sectionLimited ||
        !scope.canReadBranch({ id: staff.branchId, schoolId: staff.schoolId }))
    )
      throw forbiddenScope();
    return this.teacherWeek(staffId, weekOf);
  }

  async forMe(
    user: AuthUser,
    scope: Scope,
    weekOf?: string,
    studentId?: string,
  ) {
    if (scope.guardian) {
      if (!studentId) throw invalid('studentId is required');
      const section = await this.sections.ofChild(scope, studentId);
      return this.sectionWeek(section.id, weekOf);
    }
    const staff = await this.prisma.staff.findUnique({
      where: { userId: user.id },
    });
    if (!staff) throw notFound('Staff profile');
    return this.teacherWeek(staff.id, weekOf);
  }

  private async teacherWeek(
    staffId: string,
    weekOf?: string,
  ): Promise<TeacherSlotDto[]> {
    const dates = weekDates(weekOf);
    const [regular, overrides] = await Promise.all([
      this.prisma.timetableSlot.findMany({
        where: {
          staffId,
          published: true,
          timetable: { session: { status: 'ACTIVE' } },
        },
        include: SLOT_INCLUDE,
      }),
      this.overrides(
        { OR: [{ substituteStaffId: staffId }, { originalStaffId: staffId }] },
        dates,
      ),
    ]);
    const covering = await this.slotsFor(
      overrides.filter((o) => o.substituteStaffId === staffId),
    );
    return this.build(dates, regular, overrides, covering, staffId);
  }

  private async sectionWeek(
    sectionId: string,
    weekOf?: string,
  ): Promise<TeacherSlotDto[]> {
    const dates = weekDates(weekOf);
    const [regular, overrides] = await Promise.all([
      this.prisma.timetableSlot.findMany({
        where: {
          published: true,
          timetable: { sectionId, session: { status: 'ACTIVE' } },
        },
        include: SLOT_INCLUDE,
      }),
      this.overrides({ sectionId }, dates),
    ]);
    return this.build(dates, regular, overrides, [], null);
  }

  private overrides(where: Prisma.TimetableOverrideWhereInput, dates: Date[]) {
    return this.prisma.timetableOverride.findMany({
      where: {
        ...where,
        cancelledAt: null,
        date: { gte: dates[0], lte: dates[6] },
      },
      include: { substituteStaff: { select: { id: true, name: true } } },
    });
  }

  /** The section slot each covering override replaces. */
  private async slotsFor(
    overrides: { sectionId: string; date: Date; periodIndex: number }[],
  ) {
    const result: { key: string; slot: WeekSlot }[] = [];
    for (const o of overrides) {
      const slot = await this.prisma.timetableSlot.findFirst({
        where: {
          published: true,
          day: isoWeekday(o.date),
          periodIndex: o.periodIndex,
          timetable: { sectionId: o.sectionId, session: { status: 'ACTIVE' } },
        },
        include: SLOT_INCLUDE,
      });
      if (slot)
        result.push({
          key: `${o.sectionId}@${formatDate(o.date)}#${o.periodIndex}`,
          slot,
        });
    }
    return result;
  }

  private async build(
    dates: Date[],
    regular: WeekSlot[],
    overrides: Awaited<ReturnType<WeekViewService['overrides']>>,
    covering: { key: string; slot: WeekSlot }[],
    staffId: string | null,
  ): Promise<TeacherSlotDto[]> {
    const branchIds = [
      ...new Set(
        [...regular, ...covering.map((c) => c.slot)].map(
          (s) => s.timetable.branchId,
        ),
      ),
    ];
    const rows = await this.prisma.branchPeriod.findMany({
      where: { branchId: { in: branchIds } },
    });
    const timeOf = (branchId: string, day: number, index: number) =>
      periodsForDay(
        rows.filter((p) => p.branchId === branchId),
        day,
      ).find((p) => p.index === index);
    const overrideAt = new Map(
      overrides.map((o) => [
        `${o.sectionId}@${formatDate(o.date)}#${o.periodIndex}`,
        o,
      ]),
    );

    const out: TeacherSlotDto[] = [];
    const push = (
      date: Date,
      slot: WeekSlot,
      isSubstitute: boolean,
      staff: { id: string; name: string },
    ) => {
      const period = timeOf(
        slot.timetable.branchId,
        slot.day,
        slot.periodIndex,
      );
      out.push({
        date: formatDate(date),
        day: slot.day,
        periodIndex: slot.periodIndex,
        periodNumber: period?.number ?? null,
        startTime: period?.startTime ?? '',
        endTime: period?.endTime ?? '',
        section: {
          id: slot.timetable.section.id,
          name: slot.timetable.section.name,
          className: slot.timetable.section.schoolClass.name,
        },
        subject: slot.subject,
        staff,
        room: slot.room,
        isSubstitute,
      });
    };
    for (const date of dates) {
      const day = isoWeekday(date);
      for (const slot of regular.filter((s) => s.day === day)) {
        const o = overrideAt.get(
          `${slot.timetable.section.id}@${formatDate(date)}#${slot.periodIndex}`,
        );
        if (!o) push(date, slot, false, slot.staff);
        else if (staffId === null) push(date, slot, true, o.substituteStaff);
      }
      for (const c of covering.filter((c) =>
        c.key.includes(`@${formatDate(date)}#`),
      )) {
        push(date, c.slot, true, overrideAt.get(c.key)!.substituteStaff);
      }
    }
    return out.sort(
      (a, b) => a.date.localeCompare(b.date) || a.periodIndex - b.periodIndex,
    );
  }
}
