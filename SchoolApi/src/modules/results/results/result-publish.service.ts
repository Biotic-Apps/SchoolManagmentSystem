import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type { ExamDto } from '../exams/dto/exam.dto';
import { ExamMapper } from '../exams/exam.mapper';
import { ReportCardsService } from '../report-cards/report-cards.service';
import { ExamAccessService } from '../shared/exam-access.service';

/** POST /exams/:id/publish: PUBLISHED, one report card job per student, guardians notified. */
@Injectable()
export class ResultPublishService {
  private readonly logger = new Logger(ResultPublishService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ExamAccessService,
    private readonly reportCards: ReportCardsService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
    private readonly mapper: ExamMapper,
    private readonly audit: AuditService,
  ) {}

  async publish(user: AuthUser, scope: Scope, id: string): Promise<ExamDto> {
    const exam = await this.access.manage(scope, id);
    if (exam.status !== 'RESULTS_APPROVED')
      throw conflict('Only approved results can be published');
    const updated = await this.prisma.exam.updateMany({
      where: { id, status: 'RESULTS_APPROVED' },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedById: user.id,
        version: { increment: 1 },
      },
    });
    if (updated.count === 0) throw conflict('The exam changed; try again');
    this.audit.stage({
      action: 'exam.publish',
      entityType: 'Exam',
      entityId: id,
      schoolId: exam.schoolId,
      branchId: exam.branchId,
      before: { status: exam.status },
      after: { status: 'PUBLISHED' },
    });

    const results = await this.prisma.examResult.findMany({
      where: { examId: id },
      select: { id: true, examId: true, studentId: true, schoolId: true },
    });
    for (const result of results) {
      try {
        await this.reportCards.issue(user, result, user.id, true);
      } catch (error) {
        // A failed render request never blocks publishing; the card can be requested again.
        this.logger.error(`Report card request failed for ${result.id}`, error);
      }
    }
    await this.notifications.notify({
      userIds: await this.people.guardianUserIds(
        results.map((r) => r.studentId),
      ),
      category: 'RESULT',
      title: 'Results published',
      body: `${exam.name} results are now available.`,
      data: { examId: id },
    });
    return this.mapper.withPapers(id);
  }
}
