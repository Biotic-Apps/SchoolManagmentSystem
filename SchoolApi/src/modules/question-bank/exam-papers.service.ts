import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { invalid, notFound } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../core/common/pagination/paginate';
import { toJson } from '../../core/common/prisma-json';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type {
  ExamPaperDto,
  ExamPaperQueryDto,
  GenerateExamPaperDto,
  PaperSectionDto,
  UpdateExamPaperDto,
} from './dto/exam-paper.dto';
import { toExamPaperDto } from './question-bank.mapper';
import { QuestionsRepository } from './questions.repository';

@Injectable()
export class ExamPapersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionsRepo: QuestionsRepository,
  ) {}

  async list(
    scope: Scope,
    query: ExamPaperQueryDto,
  ): Promise<PageResult<ExamPaperDto>> {
    const where: Prisma.GeneratedPaperWhereInput = {
      AND: [
        scope.schoolFilter(),
        {
          schoolId: query.schoolId,
          subjectId: query.subjectId,
          classId: query.classId,
          status: query.status,
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.generatedPaper.findMany({
        where,
        include: {
          subject: { select: { id: true, name: true } },
          class: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.generatedPaper.count({ where }),
    ]);
    return toPageResult(rows.map(toExamPaperDto), total, query);
  }

  async get(scope: Scope, id: string): Promise<ExamPaperDto> {
    const row = await this.prisma.generatedPaper.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    });
    if (!row || !scope.schoolIds.has(row.schoolId))
      throw notFound('Exam paper');
    return toExamPaperDto(row);
  }

  /** Auto-generate an exam paper by randomly picking questions per section. */
  async generate(
    user: AuthUser,
    scope: Scope,
    dto: GenerateExamPaperDto,
  ): Promise<ExamPaperDto> {
    if (!scope.schoolIds.has(dto.schoolId))
      throw invalid('School not in your scope');

    const sections: PaperSectionDto[] = [];
    const usedIds = new Set<string>();

    for (const section of dto.sections) {
      const questions = await this.questionsRepo.randomByFilter(
        dto.schoolId,
        dto.subjectId,
        dto.classId,
        section.type,
        section.difficulty,
      );
      const available = questions.filter((q) => !usedIds.has(q.id));
      if (available.length < section.questionCount) {
        throw invalid(
          `Not enough ${section.type} (${section.difficulty}) questions available. ` +
            `Needed ${section.questionCount}, found ${available.length}.`,
        );
      }
      const picked = available.slice(0, section.questionCount);
      picked.forEach((q) => usedIds.add(q.id));
      sections.push({
        title: section.title,
        questionIds: picked.map((q) => q.id),
        marks: section.questionCount * section.marksPerQuestion,
      });
    }

    const row = await this.prisma.generatedPaper.create({
      data: {
        schoolId: dto.schoolId,
        subjectId: dto.subjectId,
        classId: dto.classId,
        title: dto.title.trim(),
        totalMarks: dto.totalMarks,
        duration: dto.duration,
        sections: toJson(sections),
        createdById: user.id,
      },
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    });
    return toExamPaperDto(row);
  }

  async update(
    scope: Scope,
    id: string,
    dto: UpdateExamPaperDto,
  ): Promise<ExamPaperDto> {
    const existing = await this.prisma.generatedPaper.findUnique({
      where: { id },
    });
    if (!existing || !scope.schoolIds.has(existing.schoolId))
      throw notFound('Exam paper');

    const row = await this.prisma.generatedPaper.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.totalMarks !== undefined && { totalMarks: dto.totalMarks }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    });
    return toExamPaperDto(row);
  }
}
