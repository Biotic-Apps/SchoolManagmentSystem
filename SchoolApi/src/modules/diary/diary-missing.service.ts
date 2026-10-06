import { Injectable } from '@nestjs/common';
import { parseDate } from '../../core/common/dates';
import { notFound } from '../../core/common/errors/errors';
import { isoWeekday, today } from '../../core/common/week';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type { MissingDiaryDto } from './dto/diary.dto';

/** Published timetable slots of the day without a PUBLISHED diary entry. */
@Injectable()
export class DiaryMissingService {
  constructor(private readonly prisma: PrismaService) {}

  async forScope(
    scope: Scope,
    branchId: string,
    date?: string,
  ): Promise<MissingDiaryDto[]> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch || scope.guardian) throw notFound('Branch');
    scope.assertReadBranch(branch);
    const rows = await this.missing(branchId, date ? parseDate(date) : today());
    return scope.sectionLimited
      ? rows.filter((r) => scope.sectionIds.has(r.sectionId))
      : rows;
  }

  async missing(branchId: string, day: Date): Promise<MissingDiaryDto[]> {
    const slots = await this.prisma.timetableSlot.findMany({
      where: {
        published: true,
        day: isoWeekday(day),
        timetable: { branchId, session: { status: 'ACTIVE' } },
      },
      select: {
        subject: { select: { id: true, name: true } },
        staff: { select: { id: true, name: true } },
        timetable: {
          select: {
            section: {
              select: {
                id: true,
                name: true,
                schoolClass: { select: { name: true, levelOrder: true } },
              },
            },
          },
        },
      },
    });
    const published = await this.prisma.diaryEntry.findMany({
      where: { branchId, date: day, status: 'PUBLISHED' },
      select: { sectionId: true, subjectId: true },
    });
    const done = new Set(published.map((p) => `${p.sectionId}:${p.subjectId}`));
    const seen = new Map<string, MissingDiaryDto & { level: number }>();
    for (const slot of slots) {
      const section = slot.timetable.section;
      const key = `${section.id}:${slot.subject.id}`;
      if (done.has(key) || seen.has(key)) continue;
      seen.set(key, {
        sectionId: section.id,
        className: section.schoolClass.name,
        sectionName: section.name,
        subject: slot.subject,
        teacher: slot.staff,
        level: section.schoolClass.levelOrder,
      });
    }
    return [...seen.values()]
      .sort(
        (a, b) =>
          a.level - b.level ||
          a.sectionName.localeCompare(b.sectionName) ||
          a.subject.name.localeCompare(b.subject.name),
      )
      .map((row) => ({
        sectionId: row.sectionId,
        className: row.className,
        sectionName: row.sectionName,
        subject: row.subject,
        teacher: row.teacher,
      }));
  }
}
