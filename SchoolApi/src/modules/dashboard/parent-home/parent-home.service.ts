import { Injectable } from '@nestjs/common';
import { formatDate } from '../../../core/common/dates';
import { notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { today } from '../../../core/common/week';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { DiaryService } from '../../diary/diary.service';
import { FeeSummaryService } from '../../fees/student-fees/fee-summary.service';
import { StudentPlacementService } from '../../school-day/student-placement.service';
import { WeekViewService } from '../../timetable/week-view.service';
import { noticeQuery, toNoticeBrief } from '../daily/briefs';
import { ParentHomeChildReader } from './parent-home-child.reader';
import { ParentHomeEventsReader } from './parent-home-events.reader';
import { ParentHomeStatsReader } from './parent-home-stats.reader';
import type { ParentHomeDto } from './parent-home.dto';

const DAY_MS = 86_400_000;
const RECENT_DIARY_DAYS = 6;

/** GET /parent/home: everything a parent's home screen shows for one verified child. */
@Injectable()
export class ParentHomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placement: StudentPlacementService,
    private readonly childReader: ParentHomeChildReader,
    private readonly stats: ParentHomeStatsReader,
    private readonly upcoming: ParentHomeEventsReader,
    private readonly diary: DiaryService,
    private readonly weeks: WeekViewService,
    private readonly fees: FeeSummaryService,
  ) {}

  async home(
    user: AuthUser,
    scope: Scope,
    studentId: string,
  ): Promise<ParentHomeDto> {
    // Staff have their own dashboards; a child that is not yours does not exist.
    if (!scope.guardian || !scope.canAccessStudent(studentId))
      throw notFound('Student');
    const child = await this.placement.read(scope, studentId);
    const day = today();
    const date = formatDate(day);
    const [
      header,
      attendance,
      fees,
      latestResult,
      homework,
      week,
      diary,
      notices,
      meetings,
      upcoming,
    ] = await Promise.all([
      this.childReader.read(studentId),
      this.stats.attendance(studentId, day),
      user.permissions.has('fees.view')
        ? this.fees.summary(scope, studentId)
        : null,
      this.stats.latestResult(studentId),
      this.stats.homework(child.sectionId, day),
      this.weeks.forMe(user, scope, date, studentId),
      this.diary.list(scope, {
        sectionId: child.sectionId,
        from: formatDate(new Date(day.getTime() - RECENT_DIARY_DAYS * DAY_MS)),
        to: date,
      }),
      this.prisma.noticeRecipient.findMany(noticeQuery(user.id, day)),
      this.upcoming.meetings(studentId, day),
      this.upcoming.events(scope, child, day),
    ]);
    return {
      child: header,
      attendance,
      fees,
      latestResult,
      homework,
      todayPeriods: week
        .filter((p) => p.date === date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
      diary: diary.slice(0, 5),
      notices: notices.map(toNoticeBrief),
      meetings,
      events: upcoming.events,
      consentsPending: upcoming.consentsPending,
    };
  }
}
