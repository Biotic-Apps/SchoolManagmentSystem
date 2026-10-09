import { Injectable } from '@nestjs/common';
import { formatDate } from '../../../core/common/dates';
import { notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { today } from '../../../core/common/week';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { DiaryService } from '../../diary/diary.service';
import { StudentPlacementService } from '../../school-day/student-placement.service';
import type { ChildTodayDto } from '../dto/daily-dashboard.dto';
import { noticeQuery, toMeetingBrief, toNoticeBrief } from './briefs';

/** Parent home for one verified child. */
@Injectable()
export class ChildTodayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placement: StudentPlacementService,
    private readonly diary: DiaryService,
  ) {}

  async today(
    user: AuthUser,
    scope: Scope,
    studentId: string,
  ): Promise<ChildTodayDto> {
    if (!scope.guardian) throw notFound('Student');
    const child = await this.placement.read(scope, studentId);
    const day = today();
    const [entry, diary, notices, consentsPending, meeting] = await Promise.all(
      [
        this.prisma.attendanceEntry.findFirst({
          where: {
            studentId,
            register: { date: day, status: { in: ['SUBMITTED', 'LOCKED'] } },
          },
          select: { status: true },
        }),
        this.diary.list(scope, {
          sectionId: child.sectionId,
          date: formatDate(day),
        }),
        this.prisma.noticeRecipient.findMany(noticeQuery(user.id, day)),
        this.prisma.activityConsent.count({
          where: {
            studentId,
            status: 'PENDING',
            activity: { status: 'ANNOUNCED' },
          },
        }),
        this.prisma.meeting.findFirst({
          where: { studentId, status: 'SCHEDULED', date: { gte: day } },
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
          include: { staffUser: { select: { id: true, name: true } } },
        }),
      ],
    );
    return {
      attendance: { status: entry?.status ?? 'UNMARKED' },
      diary,
      notices: notices.map(toNoticeBrief),
      consentsPending,
      nextMeeting: meeting ? toMeetingBrief(meeting) : null,
    };
  }
}
