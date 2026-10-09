import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ExamAccessService } from '../shared/exam-access.service';
import { RosterService } from '../shared/roster.service';
import { StudentAccessService } from '../shared/student-access.service';
import { decimalToNumber } from '../shared/hundredths';
import type {
  ResultQueryDto,
  StudentResultDto,
  StudentResultsDto,
} from './dto/result.dto';
import { SkillCardReader } from '../skills/skill-card.reader';
import { toStudentResultDto } from './result.mapper';
import { StandingsReader } from './standings.reader';

/** Result reads: parents own children + PUBLISHED only; teachers their sections. */
@Injectable()
export class ResultsQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exams: ExamAccessService,
    private readonly students: StudentAccessService,
    private readonly roster: RosterService,
    private readonly standings: StandingsReader,
    private readonly skills: SkillCardReader,
  ) {}

  async list(scope: Scope, query: ResultQueryDto): Promise<StudentResultDto[]> {
    const exam = await this.exams.read(scope, query.examId);
    const where: Prisma.ExamResultWhereInput = {
      examId: exam.id,
      sectionId: query.sectionId,
    };
    if (scope.guardian) where.studentId = { in: [...scope.studentIds] };
    else if (!this.exams.canManage(scope, exam))
      where.AND = [{ sectionId: { in: [...scope.sectionIds] } }];
    const rows = await this.prisma.examResult.findMany({ where });
    const [people, standings] = await Promise.all([
      this.roster.people(rows.map((r) => r.studentId)),
      this.standings.of(rows),
    ]);
    return rows
      .map((r) =>
        toStudentResultDto(
          r,
          people.get(r.studentId),
          standings.get(`${r.examId}:${r.studentId}`),
        ),
      )
      .sort(
        (a, b) =>
          a.sectionId.localeCompare(b.sectionId) ||
          (a.rollNo ?? 1e9) - (b.rollNo ?? 1e9) ||
          a.name.localeCompare(b.name),
      );
  }

  async forStudent(
    scope: Scope,
    studentId: string,
  ): Promise<StudentResultsDto> {
    const student = await this.students.read(scope, studentId);
    const rows = await this.prisma.examResult.findMany({
      where: { studentId, exam: { status: 'PUBLISHED' } },
      include: {
        exam: {
          select: {
            name: true,
            type: true,
            publishedAt: true,
            papers: {
              select: { date: true },
              orderBy: { date: 'asc' },
              take: 1,
            },
          },
        },
      },
    });
    const person = { name: student.name, rollNo: student.rollNo };
    const [standings, skills] = await Promise.all([
      this.standings.of(rows),
      this.skills.many(rows),
    ]);
    const dated = rows
      .map((row) => ({
        row,
        date: row.exam.papers[0]?.date ?? row.exam.publishedAt ?? null,
      }))
      .sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
    return {
      studentId,
      name: student.name,
      results: dated.map(({ row }) => ({
        ...toStudentResultDto(
          row,
          person,
          standings.get(`${row.examId}:${studentId}`),
        ),
        skills: skills.get(`${row.examId}:${studentId}`) ?? [],
        examName: row.exam.name,
        examType: row.exam.type,
        publishedAt: row.exam.publishedAt?.toISOString() ?? null,
      })),
      trend: dated.map(({ row, date }) => ({
        examId: row.examId,
        examName: row.exam.name,
        date: date ? formatDate(date) : null,
        percent: decimalToNumber(row.percent) ?? 0,
      })),
    };
  }
}
