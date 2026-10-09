import { Injectable } from '@nestjs/common';
import { notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { GeneratedDocumentService } from '../../generated-docs/generated-document.service';
import type { TaskRequester } from '../../tasks/async-task.service';
import { StudentAccessService } from '../shared/student-access.service';
import type { ReportCardViewDto } from './report-card.dto';

/**
 * Cards rendered before the current layout (class position, behaviour &
 * skills) are re-rendered once when next viewed.
 */
export const REPORT_CARD_LAYOUT_SINCE = new Date('2026-10-09T00:00:00Z');

export const outdatedCard = (document: {
  status: string;
  generatedAt: Date | null;
}): boolean =>
  document.status === 'READY' &&
  !!document.generatedAt &&
  document.generatedAt < REPORT_CARD_LAYOUT_SINCE;

export interface ResultRef {
  id: string;
  examId: string;
  studentId: string;
  schoolId: string;
}

/** REPORT_CARD documents (versioned) and their ReportCard rows. */
@Injectable()
export class ReportCardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documents: GeneratedDocumentService,
    private readonly students: StudentAccessService,
  ) {}

  /** Requests the PDF (reusing a ready one unless `fresh`) and records the version. */
  async issue(
    requester: TaskRequester,
    result: ResultRef,
    ownerUserId: string,
    fresh = false,
  ): Promise<string> {
    const { documentId } = await this.documents.request(requester, {
      kind: 'REPORT_CARD',
      entityId: result.id,
      schoolId: result.schoolId,
      ownerUserId,
      fresh,
    });
    const document = await this.prisma.generatedDocument.findUniqueOrThrow({
      where: { id: documentId },
      select: { version: true },
    });
    await this.prisma.reportCard.upsert({
      where: {
        resultId_version: { resultId: result.id, version: document.version },
      },
      create: {
        resultId: result.id,
        examId: result.examId,
        studentId: result.studentId,
        version: document.version,
        documentId,
      },
      update: { documentId },
    });
    return documentId;
  }

  /**
   * Latest card of a student's exam (default: the latest published exam).
   * Parents: own child and PUBLISHED exams only. A published result without
   * a document gets one requested (status PENDING).
   */
  async view(
    user: AuthUser,
    scope: Scope,
    studentId: string,
    examId?: string,
  ): Promise<ReportCardViewDto> {
    await this.students.read(scope, studentId);
    const result = await this.prisma.examResult.findFirst({
      where: {
        studentId,
        examId,
        ...(scope.guardian ? { exam: { status: 'PUBLISHED' } } : {}),
      },
      include: { exam: { select: { status: true, publishedAt: true } } },
      orderBy: { exam: { publishedAt: { sort: 'desc', nulls: 'last' } } },
    });
    if (!result) throw notFound('Report card');
    let document = await this.documents.latest('REPORT_CARD', result.id);
    const outdated =
      !!document &&
      outdatedCard(document) &&
      result.exam.status === 'PUBLISHED';
    if (!document || outdated) {
      if (result.exam.status !== 'PUBLISHED') throw notFound('Report card');
      await this.issue(
        user,
        result,
        document?.ownerUserId ?? user.id,
        outdated,
      );
      document = await this.documents.latest('REPORT_CARD', result.id);
    }
    const view = this.documents.view(document);
    if (!view) throw notFound('Report card');
    return {
      examId: result.examId,
      status: view.status,
      fileUrl: view.fileUrl,
      generatedAt: view.generatedAt,
      version: view.version,
    };
  }
}
