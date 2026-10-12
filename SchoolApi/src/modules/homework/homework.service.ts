import { Injectable } from '@nestjs/common';
import type { Prisma, SubmissionStatus } from '../../generated/prisma/client';
import { parseDate, formatDate } from '../../core/common/dates';
import {
  forbidden,
  invalid,
  notFound,
} from '../../core/common/errors/errors';
import { today } from '../../core/common/week';
import type { AuthUser } from '../../core/common/types/auth-user';
import { FileRefService } from '../../core/files/file-ref.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  HOMEWORK_INCLUDE,
  HomeworkMapper,
  SUBMISSION_INCLUDE,
} from './homework.mapper';
import type {
  CreateHomeworkDto,
  GradeSubmissionDto,
  HomeworkDto,
  HomeworkQueryDto,
  HomeworkSubmissionDto,
  SubmissionQueryDto,
  SubmitHomeworkDto,
  UpdateHomeworkDto,
} from './dto/homework.dto';

@Injectable()
export class HomeworkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: HomeworkMapper,
    private readonly files: FileRefService,
  ) {}

  // ─── Teacher: CRUD ──────────────────────────────────────────

  async list(
    scope: Scope,
    query: HomeworkQueryDto,
  ): Promise<HomeworkDto[]> {
    const from = query.from ? parseDate(query.from) : undefined;
    const to = query.to ? parseDate(query.to) : undefined;
    const where: Prisma.HomeworkWhereInput = {
      ...scope.sectionFilter(),
      ...(query.sectionId && { sectionId: query.sectionId }),
      ...(query.branchId && { branchId: query.branchId }),
      ...(query.subjectId && { subjectId: query.subjectId }),
      ...(query.status && { status: query.status as 'ACTIVE' | 'ARCHIVED' }),
      ...(from || to
        ? { dueDate: { ...(from && { gte: from }), ...(to && { lte: to }) } }
        : {}),
    };
    const rows = await this.prisma.homework.findMany({
      where,
      include: HOMEWORK_INCLUDE,
      orderBy: { dueDate: 'desc' },
      take: 200,
    });
    // Batch load graded counts
    const ids = rows.map((r) => r.id);
    const graded = ids.length
      ? await this.prisma.homeworkSubmission.groupBy({
          by: ['homeworkId'],
          where: { homeworkId: { in: ids }, status: 'GRADED' },
          _count: true,
        })
      : [];
    const gradedMap = new Map(
      graded.map((g) => [g.homeworkId, g._count]),
    );
    return this.mapper.toHomeworkDtos(rows, gradedMap);
  }

  async listForStudent(
    scope: Scope,
    studentId: string,
    query: HomeworkQueryDto,
  ): Promise<HomeworkDto[]> {
    // Guardian scope: verify student belongs to the guardian
    scope.assertGuardianStudent(studentId);
    // Find student enrollment to get their section
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId, status: 'ACTIVE' },
      select: { sectionId: true, section: { select: { schoolId: true } } },
    });
    if (!enrollment) return [];
    const from = query.from ? parseDate(query.from) : undefined;
    const to = query.to ? parseDate(query.to) : undefined;
    const where: Prisma.HomeworkWhereInput = {
      sectionId: enrollment.sectionId,
      status: 'ACTIVE',
      ...(query.subjectId && { subjectId: query.subjectId }),
      ...(from || to
        ? { dueDate: { ...(from && { gte: from }), ...(to && { lte: to }) } }
        : {}),
    };
    const rows = await this.prisma.homework.findMany({
      where,
      include: HOMEWORK_INCLUDE,
      orderBy: { dueDate: 'desc' },
      take: 200,
    });
    return this.mapper.toHomeworkDtos(rows);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateHomeworkDto,
  ): Promise<HomeworkDto> {
    const section = await this.prisma.section.findUnique({
      where: { id: dto.sectionId },
      select: {
        id: true,
        schoolId: true,
        branchId: true,
        classId: true,
      },
    });
    if (!section) throw notFound('Section');
    scope.assertReadSection({
      id: section.id,
      branchId: section.branchId,
      schoolId: section.schoolId,
    });
    // Validate file attachments
    for (const fileId of dto.attachmentFileIds ?? []) {
      await this.files.assertUsable(fileId, {
        schoolId: section.schoolId,
        userId: user.id,
        purposes: ['ATTACHMENT', 'DOCUMENT'],
      });
    }
    const dueDate = parseDate(dto.dueDate);
    const row = await this.prisma.homework.create({
      data: {
        schoolId: section.schoolId,
        branchId: section.branchId,
        classId: section.classId,
        sectionId: dto.sectionId,
        subjectId: dto.subjectId,
        title: dto.title,
        description: dto.description,
        dueDate,
        maxMarks: dto.maxMarks ?? null,
        attachmentFileIds: dto.attachmentFileIds ?? [],
        assignedById: user.id,
      },
      include: HOMEWORK_INCLUDE,
    });
    return this.mapper.toHomeworkDto(row);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    homeworkId: string,
    dto: UpdateHomeworkDto,
  ): Promise<HomeworkDto> {
    const hw = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
      include: { section: { select: { id: true, branchId: true, schoolId: true } } },
    });
    if (!hw) throw notFound('Homework');
    scope.assertReadSection(hw.section);
    // Validate new attachments
    if (dto.attachmentFileIds) {
      for (const fileId of dto.attachmentFileIds) {
        await this.files.assertUsable(fileId, {
          schoolId: hw.schoolId,
          userId: user.id,
          purposes: ['ATTACHMENT', 'DOCUMENT'],
        });
      }
    }
    const row = await this.prisma.homework.update({
      where: { id: homeworkId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.dueDate !== undefined && { dueDate: parseDate(dto.dueDate) }),
        ...(dto.maxMarks !== undefined && { maxMarks: dto.maxMarks }),
        ...(dto.attachmentFileIds !== undefined && {
          attachmentFileIds: dto.attachmentFileIds,
        }),
      },
      include: HOMEWORK_INCLUDE,
    });
    return this.mapper.toHomeworkDto(row);
  }

  async archive(
    scope: Scope,
    homeworkId: string,
  ): Promise<HomeworkDto> {
    const hw = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
      include: { section: { select: { id: true, branchId: true, schoolId: true } } },
    });
    if (!hw) throw notFound('Homework');
    scope.assertReadSection(hw.section);
    const row = await this.prisma.homework.update({
      where: { id: homeworkId },
      data: { status: 'ARCHIVED' },
      include: HOMEWORK_INCLUDE,
    });
    return this.mapper.toHomeworkDto(row);
  }

  // ─── Student / Parent: Submit ────────────────────────────────

  async submit(
    user: AuthUser,
    scope: Scope,
    homeworkId: string,
    studentId: string,
    dto: SubmitHomeworkDto,
  ): Promise<HomeworkSubmissionDto> {
    scope.assertGuardianStudent(studentId);
    const hw = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
    });
    if (!hw || hw.status !== 'ACTIVE') throw notFound('Homework');
    // Verify student is enrolled in the homework's section
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        sectionId: hw.sectionId,
        status: 'ACTIVE',
      },
    });
    if (!enrollment) throw forbidden('Student not enrolled in this class');
    // Validate file attachments
    for (const fileId of dto.fileIds ?? []) {
      await this.files.assertUsable(fileId, {
        schoolId: hw.schoolId,
        userId: user.id,
        purposes: ['ATTACHMENT', 'DOCUMENT'],
      });
    }
    if (!dto.text && !(dto.fileIds?.length)) {
      throw invalid('Submission must include text or at least one file');
    }
    const isLate = today() > hw.dueDate;
    const status: SubmissionStatus = isLate ? 'LATE' : 'SUBMITTED';
    // Upsert to allow re-submission
    const row = await this.prisma.homeworkSubmission.upsert({
      where: {
        homeworkId_studentId: { homeworkId, studentId },
      },
      create: {
        homeworkId,
        studentId,
        text: dto.text ?? null,
        fileIds: dto.fileIds ?? [],
        status,
      },
      update: {
        text: dto.text ?? null,
        fileIds: dto.fileIds ?? [],
        submittedAt: new Date(),
        status,
        // Clear previous grading on re-submission
        marks: null,
        grade: null,
        feedback: null,
        gradedById: null,
        gradedAt: null,
      },
      include: SUBMISSION_INCLUDE,
    });
    return this.mapper.toSubmissionDto(row);
  }

  // ─── Teacher: View submissions & grade ──────────────────────

  async listSubmissions(
    scope: Scope,
    homeworkId: string,
    query: SubmissionQueryDto,
  ): Promise<HomeworkSubmissionDto[]> {
    const hw = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
      include: { section: { select: { id: true, branchId: true, schoolId: true } } },
    });
    if (!hw) throw notFound('Homework');
    scope.assertReadSection(hw.section);
    const where: Prisma.HomeworkSubmissionWhereInput = {
      homeworkId,
      ...(query.status && { status: query.status as SubmissionStatus }),
    };
    const rows = await this.prisma.homeworkSubmission.findMany({
      where,
      include: SUBMISSION_INCLUDE,
      orderBy: { submittedAt: 'desc' },
    });
    return this.mapper.toSubmissionDtos(rows);
  }

  async grade(
    user: AuthUser,
    scope: Scope,
    submissionId: string,
    dto: GradeSubmissionDto,
  ): Promise<HomeworkSubmissionDto> {
    const sub = await this.prisma.homeworkSubmission.findUnique({
      where: { id: submissionId },
      include: {
        homework: {
          include: {
            section: {
              select: { id: true, branchId: true, schoolId: true },
            },
          },
        },
      },
    });
    if (!sub) throw notFound('Submission');
    scope.assertReadSection(sub.homework.section);
    if (sub.homework.maxMarks != null && dto.marks != null) {
      if (dto.marks > sub.homework.maxMarks) {
        throw invalid(
          `Marks cannot exceed max marks (${sub.homework.maxMarks})`,
        );
      }
    }
    const row = await this.prisma.homeworkSubmission.update({
      where: { id: submissionId },
      data: {
        marks: dto.marks ?? null,
        grade: dto.grade ?? null,
        feedback: dto.feedback ?? null,
        gradedById: user.id,
        gradedAt: new Date(),
        status: 'GRADED',
      },
      include: SUBMISSION_INCLUDE,
    });
    return this.mapper.toSubmissionDto(row);
  }

  async returnSubmission(
    user: AuthUser,
    scope: Scope,
    submissionId: string,
    feedback: string,
  ): Promise<HomeworkSubmissionDto> {
    const sub = await this.prisma.homeworkSubmission.findUnique({
      where: { id: submissionId },
      include: {
        homework: {
          include: {
            section: {
              select: { id: true, branchId: true, schoolId: true },
            },
          },
        },
      },
    });
    if (!sub) throw notFound('Submission');
    scope.assertReadSection(sub.homework.section);
    const row = await this.prisma.homeworkSubmission.update({
      where: { id: submissionId },
      data: {
        feedback,
        gradedById: user.id,
        gradedAt: new Date(),
        status: 'RETURNED',
      },
      include: SUBMISSION_INCLUDE,
    });
    return this.mapper.toSubmissionDto(row);
  }

  // ─── Student / Parent: view own submission & grade ──────────

  async getStudentSubmission(
    scope: Scope,
    homeworkId: string,
    studentId: string,
  ): Promise<HomeworkSubmissionDto | null> {
    scope.assertGuardianStudent(studentId);
    const row = await this.prisma.homeworkSubmission.findUnique({
      where: { homeworkId_studentId: { homeworkId, studentId } },
      include: SUBMISSION_INCLUDE,
    });
    if (!row) return null;
    return this.mapper.toSubmissionDto(row);
  }
}
