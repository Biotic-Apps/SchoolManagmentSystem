import { Injectable } from '@nestjs/common';
import { invalid, notFound } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import { toPageResult } from '../../core/common/pagination/paginate';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type {
  CreateQuestionDto,
  QuestionDto,
  QuestionQueryDto,
  UpdateQuestionDto,
} from './dto/question.dto';
import { toQuestionDto } from './question-bank.mapper';
import { QuestionsRepository } from './questions.repository';
import { toJson } from '../../core/common/prisma-json';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: QuestionsRepository,
  ) {}

  async list(
    scope: Scope,
    query: QuestionQueryDto,
  ): Promise<PageResult<QuestionDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(rows.map(toQuestionDto), total, query);
  }

  async get(scope: Scope, id: string): Promise<QuestionDto> {
    const row = await this.repository.findById(id);
    if (!row || !scope.schoolIds.has(row.schoolId)) throw notFound('Question');
    return toQuestionDto(row);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateQuestionDto,
  ): Promise<QuestionDto> {
    if (!scope.schoolIds.has(dto.schoolId))
      throw invalid('School not in your scope');
    // Validate subject belongs to this school
    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
    });
    if (!subject || subject.schoolId !== dto.schoolId)
      throw invalid('Subject does not belong to this school');
    // Validate class belongs to this school
    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id: dto.classId },
    });
    if (!schoolClass || schoolClass.schoolId !== dto.schoolId)
      throw invalid('Class does not belong to this school');

    const row = await this.repository.create({
      schoolId: dto.schoolId,
      subjectId: dto.subjectId,
      classId: dto.classId,
      chapterName: dto.chapterName.trim(),
      questionType: dto.questionType,
      difficultyLevel: dto.difficultyLevel,
      marks: dto.marks,
      questionText: dto.questionText.trim(),
      options: dto.options ? toJson(dto.options) : undefined,
      correctAnswer: dto.correctAnswer.trim(),
      createdById: user.id,
    });
    return toQuestionDto(row);
  }

  async update(
    scope: Scope,
    id: string,
    dto: UpdateQuestionDto,
  ): Promise<QuestionDto> {
    const existing = await this.repository.findById(id);
    if (!existing || !scope.schoolIds.has(existing.schoolId))
      throw notFound('Question');

    const row = await this.repository.update(id, {
      ...(dto.chapterName !== undefined && {
        chapterName: dto.chapterName.trim(),
      }),
      ...(dto.questionType !== undefined && { questionType: dto.questionType }),
      ...(dto.difficultyLevel !== undefined && {
        difficultyLevel: dto.difficultyLevel,
      }),
      ...(dto.marks !== undefined && { marks: dto.marks }),
      ...(dto.questionText !== undefined && {
        questionText: dto.questionText.trim(),
      }),
      ...(dto.options !== undefined && { options: toJson(dto.options) }),
      ...(dto.correctAnswer !== undefined && {
        correctAnswer: dto.correctAnswer.trim(),
      }),
      ...(dto.status !== undefined && { status: dto.status }),
    });
    return toQuestionDto(row);
  }

  async archive(scope: Scope, id: string): Promise<QuestionDto> {
    const existing = await this.repository.findById(id);
    if (!existing || !scope.schoolIds.has(existing.schoolId))
      throw notFound('Question');
    const row = await this.repository.update(id, { status: 'ARCHIVED' });
    return toQuestionDto(row);
  }
}
