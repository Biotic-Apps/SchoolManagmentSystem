import { Injectable } from '@nestjs/common';
import { formatDate } from '../../../core/common/dates';
import { schoolDate } from '../../../core/common/school-time';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { MyActivitiesService } from '../../activities/my-activities.service';
import type { StudentPlacement } from '../../school-day/student-placement.service';
import { toMeetingBrief } from '../daily/briefs';
import type { MeetingBriefDto } from '../dto/daily-dashboard.dto';
import type { ParentHomeEventDto } from './parent-home.dto';

const MAX_EVENTS = 5;

/** What is coming up for the child: meetings, activities, calendar events. */
@Injectable()
export class ParentHomeEventsReader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activities: MyActivitiesService,
  ) {}

  async meetings(studentId: string, day: Date): Promise<MeetingBriefDto[]> {
    const rows = await this.prisma.meeting.findMany({
      where: { studentId, status: 'SCHEDULED', date: { gte: day } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      include: { staffUser: { select: { id: true, name: true } } },
      take: 3,
    });
    return rows.map(toMeetingBrief);
  }

  /** Activities the child may join and school/branch calendar entries, soonest first. */
  async events(
    scope: Scope,
    child: StudentPlacement,
    day: Date,
  ): Promise<{ events: ParentHomeEventDto[]; consentsPending: number }> {
    const [mine, calendar] = await Promise.all([
      this.activities.forChild(scope, child.studentId),
      this.prisma.calendarEvent.findMany({
        where: {
          schoolId: child.schoolId,
          status: 'ACTIVE',
          endDate: { gte: day },
          OR: [{ branchId: null }, { branchId: child.branchId }],
        },
        orderBy: { startDate: 'asc' },
        take: MAX_EVENTS,
      }),
    ]);
    const events: ParentHomeEventDto[] = [
      ...mine.upcoming.map((a) => ({
        id: a.id,
        kind: 'ACTIVITY',
        title: a.title,
        startDate: schoolDate(new Date(a.startAt)),
        endDate: schoolDate(new Date(a.endAt)),
      })),
      ...calendar.map((e) => ({
        id: e.id,
        kind: e.type,
        title: e.title,
        startDate: formatDate(e.startDate),
        endDate: formatDate(e.endDate),
      })),
    ];
    events.sort((a, b) => a.startDate.localeCompare(b.startDate));
    return {
      events: events.slice(0, MAX_EVENTS),
      consentsPending: mine.consentPending.length,
    };
  }
}
