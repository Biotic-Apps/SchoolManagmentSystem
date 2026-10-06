import { Injectable } from '@nestjs/common';
import { formatDate } from '../../../core/common/dates';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { today } from '../../../core/common/week';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { WeekViewService } from '../../timetable/week-view.service';
import type { TeacherTodayDto } from '../dto/daily-dashboard.dto';
import { unreadMessageCount } from './unread-messages';

/** Teacher home: today's periods, registers, diaries still to publish. */
@Injectable()
export class TeacherTodayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly weeks: WeekViewService,
  ) {}

  async today(user: AuthUser, scope: Scope): Promise<TeacherTodayDto> {
    const day = today();
    const date = formatDate(day);
    const staff = await this.prisma.staff.findUnique({
      where: { userId: user.id },
    });
    const periods = staff
      ? (await this.weeks.forMe(user, scope, date)).filter(
          (p) => p.date === date,
        )
      : [];
    const sectionIds = [...scope.classSectionIds];
    const [registers, published, unreadMessages, assignedComplaints] =
      await Promise.all([
        this.prisma.attendanceRegister.findMany({
          where: { sectionId: { in: sectionIds }, date: day },
          select: { sectionId: true, status: true },
        }),
        this.prisma.diaryEntry.findMany({
          where: {
            sectionId: { in: periods.map((p) => p.section.id) },
            date: day,
            status: 'PUBLISHED',
          },
          select: { sectionId: true, subjectId: true },
        }),
        unreadMessageCount(this.prisma, user.id),
        this.prisma.complaint.count({
          where: {
            assigneeId: user.id,
            status: { notIn: ['RESOLVED', 'CLOSED'] },
          },
        }),
      ]);
    const status = new Map(registers.map((r) => [r.sectionId, r.status]));
    const done = new Set(published.map((p) => `${p.sectionId}:${p.subjectId}`));
    const pending = new Map<string, { sectionId: string; subjectId: string }>();
    for (const p of periods) {
      const key = `${p.section.id}:${p.subject.id}`;
      if (!done.has(key))
        pending.set(key, { sectionId: p.section.id, subjectId: p.subject.id });
    }
    return {
      periods,
      registers: sectionIds.map((sectionId) => ({
        sectionId,
        status: status.get(sectionId) ?? 'UNMARKED',
      })),
      diariesPending: [...pending.values()],
      unreadMessages,
      assignedComplaints,
    };
  }
}
