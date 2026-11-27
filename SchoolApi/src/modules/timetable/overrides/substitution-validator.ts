import { Injectable } from '@nestjs/common';
import type { Section, Staff } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import { conflict, invalid } from '../../../core/common/errors/errors';
import { isoWeekday, today } from '../../../core/common/week';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { WorkingDayService } from '../../school-day/working-day.service';
import { teachingStaffWhere } from '../../staff/allocation/teaching-staff.service';

/**
 * Substitution rules (backendFlows §5 conflict check): a working day of the
 * section's session from today on, and a substitute who is teaching staff,
 * not on approved leave and free in that period (no own lesson that is not
 * itself covered, no other substitution).
 */
@Injectable()
export class SubstitutionValidator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workingDays: WorkingDayService,
  ) {}

  async assertDate(section: Section, date: Date): Promise<void> {
    if (date < today())
      throw invalid('Substitutions cannot be set for a past day');
    const session = await this.prisma.academicSession.findUnique({
      where: { id: section.sessionId },
      select: { startDate: true, endDate: true },
    });
    if (session && (date < session.startDate || date > session.endDate))
      throw invalid(`${formatDate(date)} is outside the academic session`);
    await this.workingDays.assertWorkingDay(section.branchId, date);
  }

  async assertSubstitute(
    section: Section,
    substitute: Staff,
    date: Date,
    periodIndex: number,
  ): Promise<void> {
    const teaching = await this.prisma.staff.count({
      where: {
        id: substitute.id,
        OR: teachingStaffWhere(section.branchId, section.sessionId),
      },
    });
    if (teaching === 0)
      throw invalid(
        'Substitute must be teaching staff (teacher, coordinator or principal)',
      );
    const onLeave = await this.prisma.leaveRequest.count({
      where: {
        kind: 'STAFF',
        staffId: substitute.id,
        status: 'APPROVED',
        fromDate: { lte: date },
        toDate: { gte: date },
      },
    });
    if (onLeave > 0)
      throw conflict(`${substitute.name} is on approved leave that day`);
    const covering = await this.prisma.timetableOverride.count({
      where: {
        substituteStaffId: substitute.id,
        date,
        periodIndex,
        cancelledAt: null,
      },
    });
    if (covering > 0)
      throw conflict(
        `${substitute.name} already covers another class in period ${periodIndex}`,
      );
    const lessons = await this.prisma.timetableSlot.findMany({
      where: {
        staffId: substitute.id,
        published: true,
        day: isoWeekday(date),
        periodIndex,
        timetable: { sessionId: section.sessionId },
      },
      select: { timetable: { select: { sectionId: true } } },
    });
    for (const lesson of lessons) {
      const covered = await this.prisma.timetableOverride.count({
        where: {
          sectionId: lesson.timetable.sectionId,
          date,
          periodIndex,
          cancelledAt: null,
        },
      });
      if (covered === 0)
        throw conflict(
          `${substitute.name} teaches another class in period ${periodIndex}`,
        );
    }
  }
}
