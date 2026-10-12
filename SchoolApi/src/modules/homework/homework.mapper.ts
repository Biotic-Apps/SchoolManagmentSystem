import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import { UrlSigner } from '../../core/files/url-signer';
import { PrismaService } from '../../core/prisma/prisma.service';
import type {
  HomeworkDto,
  HomeworkSubmissionDto,
} from './dto/homework.dto';

export interface Attachment {
  id: string;
  url: string;
  mime: string;
  name: string;
}

export const HOMEWORK_INCLUDE = {
  section: {
    select: { name: true, schoolClass: { select: { name: true } } },
  },
  subject: { select: { id: true, name: true } },
  assignedBy: { select: { id: true, name: true } },
  _count: { select: { submissions: true } },
} satisfies Prisma.HomeworkInclude;

export type HomeworkRow = Prisma.HomeworkGetPayload<{
  include: typeof HOMEWORK_INCLUDE;
}>;

export const SUBMISSION_INCLUDE = {
  student: { select: { id: true, firstName: true, lastName: true } },
  gradedBy: { select: { id: true, name: true } },
} satisfies Prisma.HomeworkSubmissionInclude;

export type SubmissionRow = Prisma.HomeworkSubmissionGetPayload<{
  include: typeof SUBMISSION_INCLUDE;
}>;

@Injectable()
export class HomeworkMapper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly signer: UrlSigner,
  ) {}

  async toHomeworkDtos(
    rows: HomeworkRow[],
    gradedCounts?: Map<string, number>,
  ): Promise<HomeworkDto[]> {
    const fileIds = [
      ...new Set(rows.flatMap((r) => r.attachmentFileIds)),
    ];
    const fileMap = await this.loadFiles(fileIds);
    return rows.map((row) => ({
      id: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      classId: row.classId,
      sectionId: row.sectionId,
      className: row.section.schoolClass.name,
      sectionName: row.section.name,
      subject: row.subject,
      title: row.title,
      description: row.description,
      dueDate: formatDate(row.dueDate),
      maxMarks: row.maxMarks,
      attachments: this.mapAttachments(row.attachmentFileIds, fileMap),
      assignedBy: row.assignedBy,
      status: row.status,
      submissionCount: row._count.submissions,
      gradedCount: gradedCounts?.get(row.id) ?? 0,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async toHomeworkDto(row: HomeworkRow): Promise<HomeworkDto> {
    const gradedCount = await this.prisma.homeworkSubmission.count({
      where: { homeworkId: row.id, status: 'GRADED' },
    });
    return (
      await this.toHomeworkDtos([row], new Map([[row.id, gradedCount]]))
    )[0];
  }

  async toSubmissionDtos(
    rows: SubmissionRow[],
  ): Promise<HomeworkSubmissionDto[]> {
    const fileIds = [...new Set(rows.flatMap((r) => r.fileIds))];
    const fileMap = await this.loadFiles(fileIds);
    return rows.map((row) => ({
      id: row.id,
      homeworkId: row.homeworkId,
      student: {
        id: row.student.id,
        name: `${row.student.firstName} ${row.student.lastName}`,
      },
      submittedAt: row.submittedAt.toISOString(),
      text: row.text,
      attachments: this.mapAttachments(row.fileIds, fileMap),
      marks: row.marks,
      grade: row.grade,
      feedback: row.feedback,
      gradedBy: row.gradedBy,
      gradedAt: row.gradedAt?.toISOString() ?? null,
      status: row.status,
    }));
  }

  async toSubmissionDto(
    row: SubmissionRow,
  ): Promise<HomeworkSubmissionDto> {
    return (await this.toSubmissionDtos([row]))[0];
  }

  private async loadFiles(
    ids: string[],
  ): Promise<
    Map<string, { id: string; mime: string; originalName: string }>
  > {
    if (!ids.length) return new Map();
    const files = await this.prisma.file.findMany({
      where: {
        id: { in: ids },
        archivedAt: null,
        scanStatus: { notIn: ['INFECTED', 'FAILED'] },
      },
    });
    return new Map(files.map((f) => [f.id, f]));
  }

  private mapAttachments(
    ids: string[],
    fileMap: Map<
      string,
      { id: string; mime: string; originalName: string }
    >,
  ): Attachment[] {
    return ids
      .map((id) => fileMap.get(id))
      .filter((f) => !!f)
      .map((f) => ({
        id: f.id,
        url: this.signer.sign(f.id).url,
        mime: f.mime,
        name: f.originalName,
      }));
  }
}
