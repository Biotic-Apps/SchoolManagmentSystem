import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { formatDate, parseDate } from '../../../core/common/dates';
import {
  conflict,
  forbiddenScope,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import { schoolDate } from '../../../core/common/school-time';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { LookupService } from '../shared/lookup.service';
import { RosterService } from '../shared/roster.service';
import { StudentAccessService } from '../shared/student-access.service';
import type {
  HomeworkCompletionDto,
  HomeworkCompletionQueryDto,
  HomeworkStatusDto,
  SaveHomeworkStatusDto,
} from './dto/progress.dto';
import { homeworkRange, summarizeHomework } from './homework-summary';

/** Teacher ticks per diary homework and the student's completion view. */
@Injectable()
export class HomeworkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roster: RosterService,
    private readonly students: StudentAccessService,
    private readonly lookup: LookupService,
    private readonly audit: AuditService,
  ) {}

  async save(
    user: AuthUser,
    scope: Scope,
    diaryEntryId: string,
    dto: SaveHomeworkStatusDto,
  ): Promise<HomeworkStatusDto> {
    const entry = await this.prisma.diaryEntry.findUnique({
      where: { id: diaryEntryId },
    });
    if (!entry || scope.guardian) throw notFound('Diary entry');
    const manages = scope.canManageBranch({
      id: entry.branchId,
      schoolId: entry.schoolId,
    });
    if (!manages && !scope.canTeach(entry.sectionId, entry.subjectId))
      throw forbiddenScope('You do not teach this subject in this section');
    if (entry.status !== 'PUBLISHED' || !entry.homework?.trim())
      throw conflict(
        'Only published diary entries with homework can be marked',
      );
    const roster = new Set(
      (await this.roster.of(entry.sectionId)).map((r) => r.studentId),
    );
    const ids = dto.entries.map((e) => e.studentId);
    const wrong = ids.filter(
      (id, i) => !roster.has(id) || ids.indexOf(id) !== i,
    );
    if (wrong.length > 0)
      throw invalid('Students not in the section or repeated', {
        studentIds: wrong,
      });

    await this.prisma.$transaction(async (tx) => {
      for (const e of dto.entries) {
        await tx.homeworkStatus.upsert({
          where: {
            diaryEntryId_studentId: { diaryEntryId, studentId: e.studentId },
          },
          create: {
            diaryEntryId,
            studentId: e.studentId,
            status: e.status,
            markedById: user.id,
          },
          update: { status: e.status, markedById: user.id },
        });
      }
    });
    this.audit.stage({
      action: 'progress.homework',
      entityType: 'DiaryEntry',
      entityId: diaryEntryId,
      schoolId: entry.schoolId,
      branchId: entry.branchId,
      after: { entries: dto.entries },
    });
    return this.statuses(diaryEntryId, entry.sectionId);
  }

  async completion(
    scope: Scope,
    studentId: string,
    query: HomeworkCompletionQueryDto,
  ): Promise<HomeworkCompletionDto> {
    const student = await this.students.read(scope, studentId);
    const range = homeworkRange(schoolDate(), query.from, query.to);
    if (!range) throw invalid('Invalid range (from ≤ to, at most 366 days)');
    const entries = await this.prisma.diaryEntry.findMany({
      where: {
        sectionId: student.sectionId,
        status: 'PUBLISHED',
        homework: { not: null },
        date: { gte: parseDate(range.from), lte: parseDate(range.to) },
      },
      orderBy: [{ date: 'desc' }, { subjectId: 'asc' }],
    });
    const withHomework = entries.filter((e) => e.homework?.trim());
    const [statuses, subjects] = await Promise.all([
      this.prisma.homeworkStatus.findMany({
        where: {
          studentId,
          diaryEntryId: { in: withHomework.map((e) => e.id) },
        },
      }),
      this.lookup.subjects(withHomework.map((e) => e.subjectId)),
    ]);
    const byEntry = new Map(statuses.map((s) => [s.diaryEntryId, s.status]));
    const items = withHomework.map((e) => ({
      diaryEntryId: e.id,
      date: formatDate(e.date),
      dueDate: e.dueDate ? formatDate(e.dueDate) : null,
      subject: { id: e.subjectId, name: subjects.get(e.subjectId) ?? '' },
      homework: e.homework!,
      status: byEntry.get(e.id) ?? null,
    }));
    return {
      studentId,
      ...range,
      entries: items,
      summary: summarizeHomework(items.map((i) => i.status)),
    };
  }

  private async statuses(
    diaryEntryId: string,
    sectionId: string,
  ): Promise<HomeworkStatusDto> {
    const [roster, rows] = await Promise.all([
      this.roster.of(sectionId),
      this.prisma.homeworkStatus.findMany({ where: { diaryEntryId } }),
    ]);
    const byStudent = new Map(rows.map((r) => [r.studentId, r.status]));
    return {
      diaryEntryId,
      entries: roster.map((r) => ({
        studentId: r.studentId,
        name: r.name,
        rollNo: r.rollNo,
        status: byStudent.get(r.studentId) ?? null,
      })),
    };
  }
}
