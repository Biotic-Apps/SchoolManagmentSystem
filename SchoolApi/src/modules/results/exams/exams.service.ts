import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict, invalid } from '../../../core/common/errors/errors';
import { isPrismaKnownError } from '../../../core/common/errors/prisma-error.mapper';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { assertSessionOpen } from '../../academic-sessions/session-lock';
import { ExamAccessService } from '../shared/exam-access.service';
import type {
  CreateExamDto,
  ExamDto,
  ExamQueryDto,
  ExamStatusDto,
  UpdateExamDto,
} from './dto/exam.dto';
import { ExamRefsService } from './exam-refs.service';
import { ExamMapper } from './exam.mapper';

const duplicateName = (error: unknown) => {
  if (isPrismaKnownError(error) && error.code === 'P2002')
    throw conflict('An exam with this name exists in the session');
  throw error;
};

/** Exam definition and lifecycle (DRAFT → SCHEDULED → MARKS_OPEN → MARKS_CLOSED). */
@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ExamAccessService,
    private readonly mapper: ExamMapper,
    private readonly refs: ExamRefsService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async list(scope: Scope, query: ExamQueryDto): Promise<PageResult<ExamDto>> {
    const where: Prisma.ExamWhereInput = {
      branchId: query.branchId,
      sessionId: query.sessionId,
      termId: query.termId,
      status: query.status,
    };
    if (scope.guardian) {
      where.AND = [
        { status: 'PUBLISHED' },
        { branchId: { in: await this.access.childBranchIds(scope) } },
      ];
    } else Object.assign(where, scope.branchFilter());
    const [rows, total] = await Promise.all([
      this.prisma.exam.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.exam.count({ where }),
    ]);
    return toPageResult(await this.mapper.many(rows), total, query);
  }

  async get(scope: Scope, id: string): Promise<ExamDto> {
    await this.access.read(scope, id);
    return this.mapper.withPapers(id);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateExamDto,
  ): Promise<ExamDto> {
    const session = await this.prisma.academicSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session || session.branchId !== dto.branchId)
      throw invalid('Session not found in this branch');
    scope.assertManageBranch({
      id: session.branchId,
      schoolId: session.schoolId,
    });
    assertSessionOpen(session);
    await this.refs.term(dto.termId, dto.sessionId);
    await this.refs.scheme(dto.gradingSchemeId, dto.sessionId);
    const classIds = await this.refs.classes(dto.classIds, session.schoolId);
    const exam = await this.prisma.exam
      .create({
        data: {
          schoolId: session.schoolId,
          branchId: session.branchId,
          sessionId: session.id,
          termId: dto.termId,
          name: dto.name.trim(),
          type: dto.type,
          gradingSchemeId: dto.gradingSchemeId,
          weightPercent: dto.weightPercent,
          classIds,
          createdById: user.id,
        },
      })
      .catch(duplicateName);
    this.audit.stage({
      action: 'exam.create',
      entityType: 'Exam',
      entityId: exam.id,
      schoolId: exam.schoolId,
      branchId: exam.branchId,
      after: dto,
    });
    return this.mapper.one(exam);
  }

  async update(scope: Scope, id: string, dto: UpdateExamDto): Promise<ExamDto> {
    const exam = await this.access.manage(scope, id);
    if (!['DRAFT', 'SCHEDULED'].includes(exam.status))
      throw conflict('Only draft or scheduled exams can be edited');
    if (dto.classIds && exam.status !== 'DRAFT')
      throw conflict('Classes can only change while the exam is a draft');
    await this.refs.term(dto.termId, exam.sessionId);
    if (dto.gradingSchemeId)
      await this.refs.scheme(dto.gradingSchemeId, exam.sessionId);
    const classIds = dto.classIds
      ? await this.refs.classes(dto.classIds, exam.schoolId)
      : undefined;
    const row = await this.prisma.exam
      .update({
        where: { id },
        data: {
          termId: dto.termId,
          name: dto.name?.trim(),
          type: dto.type,
          gradingSchemeId: dto.gradingSchemeId,
          weightPercent: dto.weightPercent,
          classIds,
          version: { increment: 1 },
        },
      })
      .catch(duplicateName);
    this.audit.stage({
      action: 'exam.update',
      entityType: 'Exam',
      entityId: id,
      schoolId: exam.schoolId,
      branchId: exam.branchId,
      before: exam,
      after: dto,
    });
    return this.mapper.withPapers(row.id);
  }

  async setStatus(
    scope: Scope,
    id: string,
    dto: ExamStatusDto,
  ): Promise<ExamDto> {
    const exam = await this.access.manage(scope, id);
    const from = dto.status === 'MARKS_OPEN' ? 'SCHEDULED' : 'MARKS_OPEN';
    if (exam.status !== from)
      throw conflict(`${dto.status} is only allowed from ${from}`);
    await this.prisma.exam.update({
      where: { id },
      data: { status: dto.status, version: { increment: 1 } },
    });
    this.audit.stage({
      action: 'exam.status',
      entityType: 'Exam',
      entityId: id,
      schoolId: exam.schoolId,
      branchId: exam.branchId,
      before: { status: exam.status },
      after: { status: dto.status },
    });
    if (dto.status === 'MARKS_OPEN') await this.notifyTeachers(id, exam.name);
    return this.mapper.withPapers(id);
  }

  private async notifyTeachers(examId: string, name: string) {
    const sheets = await this.prisma.markSheet.findMany({
      where: { examId, teacherStaffId: { not: null } },
      select: { teacherStaffId: true },
      distinct: ['teacherStaffId'],
    });
    const staff = await this.prisma.staff.findMany({
      where: { id: { in: sheets.map((s) => s.teacherStaffId!) } },
      select: { userId: true },
    });
    await this.notifications.notify({
      userIds: staff.map((s) => s.userId).filter((v): v is string => !!v),
      category: 'EXAM',
      title: 'Marks entry open',
      body: `Marks entry is open for ${name}.`,
      data: { examId },
    });
  }
}
