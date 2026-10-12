import { Injectable } from '@nestjs/common';
import type { Prisma, RecordStatus } from '../../generated/prisma/client';
import { toSkipTake } from '../../core/common/pagination/paginate';
import { containsInsensitive } from '../../core/common/search';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type { QuestionQueryDto } from './dto/question.dto';

@Injectable()
export class QuestionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: QuestionQueryDto) {
    const search = containsInsensitive(query.search);
    const where: Prisma.QuestionWhereInput = {
      AND: [
        scope.schoolFilter(),
        {
          schoolId: query.schoolId,
          subjectId: query.subjectId,
          classId: query.classId,
          questionType: query.questionType,
          difficultyLevel: query.difficultyLevel,
          status: (query.status as RecordStatus | undefined) ?? 'ACTIVE',
          ...(query.chapterName && {
            chapterName: { equals: query.chapterName, mode: 'insensitive' },
          }),
          ...(search && {
            OR: [
              { questionText: search },
              { chapterName: search },
            ],
          }),
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        include: {
          subject: { select: { id: true, name: true } },
          class: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.question.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string) {
    return this.prisma.question.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    });
  }

  create(data: Prisma.QuestionUncheckedCreateInput) {
    return this.prisma.question.create({
      data,
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    });
  }

  update(id: string, data: Prisma.QuestionUncheckedUpdateInput) {
    return this.prisma.question.update({
      where: { id },
      data,
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    });
  }

  /** All matching questions in random order; caller picks what it needs. */
  async randomByFilter(
    schoolId: string,
    subjectId: string,
    classId: string,
    questionType: string,
    difficultyLevel: string,
  ) {
    const where: Prisma.QuestionWhereInput = {
      schoolId,
      subjectId,
      classId,
      questionType: questionType as any,
      difficultyLevel: difficultyLevel as any,
      status: 'ACTIVE',
    };
    const all = await this.prisma.question.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    });
    // Fisher-Yates shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }
}
