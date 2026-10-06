import { Injectable } from '@nestjs/common';
import type { ApplicationStatus } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { invalid } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { SequenceService } from '../../core/sequences/sequence.service';
import { ApplicantNotifier } from './applicant-notifier';
import { ApplicationAccessService } from './application-access.service';
import {
  APPLICATION_INCLUDE,
  type ApplicationRow,
} from './applications.repository';
import type {
  DecideApplicationDto,
  ScheduleTestDto,
  TestResultDto,
} from './dto/application-input.dto';
import type { ApplicationDto } from './dto/application.dto';

const DECISION_STATUS: Record<
  DecideApplicationDto['decision'],
  ApplicationStatus
> = {
  OFFER: 'OFFERED',
  WAITLIST: 'WAITLISTED',
  REJECT: 'REJECTED',
};

/** Entrance test, decision and waiting-list offers (backendFlows.md §2). */
@Injectable()
export class ApplicationWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ApplicationAccessService,
    private readonly sequences: SequenceService,
    private readonly notifier: ApplicantNotifier,
    private readonly audit: AuditService,
  ) {}

  async scheduleTest(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: ScheduleTestDto,
  ) {
    const before = await this.access.loadIn(scope, id, [
      'SUBMITTED',
      'DOCUMENTS_PENDING',
      'TEST_SCHEDULED',
    ]);
    const scheduledAt = new Date(dto.scheduledAt);
    const data = {
      scheduledAt,
      venue: dto.venue,
      notes: dto.notes,
      scheduledById: user.id,
    };
    const row = await this.prisma.admissionApplication.update({
      where: { id },
      data: {
        status: 'TEST_SCHEDULED',
        updatedById: user.id,
        test: {
          upsert: {
            create: data,
            update: { ...data, score: null, maxScore: null },
          },
        },
      },
      include: APPLICATION_INCLUDE,
    });
    await this.notifier.notify(
      row,
      'Entrance test scheduled',
      `Entrance test on ${scheduledAt.toISOString().slice(0, 16).replace('T', ' ')} UTC${dto.venue ? ` at ${dto.venue}` : ''}.`,
    );
    return this.done('application.test_schedule', before, row, dto);
  }

  async recordResult(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: TestResultDto,
  ) {
    if (dto.score > dto.maxScore) throw invalid('score cannot exceed maxScore');
    const before = await this.access.loadIn(scope, id, ['TEST_SCHEDULED']);
    const row = await this.prisma.admissionApplication.update({
      where: { id },
      data: {
        status: 'TEST_COMPLETED',
        updatedById: user.id,
        test: {
          update: {
            score: dto.score,
            maxScore: dto.maxScore,
            remarks: dto.remarks,
            recordedById: user.id,
            recordedAt: new Date(),
          },
        },
      },
      include: APPLICATION_INCLUDE,
    });
    return this.done('application.test_result', before, row, dto);
  }

  async decide(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: DecideApplicationDto,
  ) {
    const before = await this.access.loadIn(scope, id, [
      'SUBMITTED',
      'DOCUMENTS_PENDING',
      'TEST_COMPLETED',
    ]);
    const status = DECISION_STATUS[dto.decision];
    const row = await this.prisma.$transaction(async (tx) => {
      const position =
        status === 'WAITLISTED'
          ? await this.sequences.next(
              tx,
              `waitlist:${before.sessionId}:${before.classId}`,
            )
          : null;
      return tx.admissionApplication.update({
        where: { id },
        data: {
          status,
          waitlistPosition: position,
          decisionReason: dto.reason,
          decidedById: user.id,
          decidedAt: new Date(),
          updatedById: user.id,
        },
        include: APPLICATION_INCLUDE,
      });
    });
    const message = {
      OFFERED:
        'A seat has been offered. Please confirm with the school office.',
      WAITLISTED: `The application is on the waiting list (position ${row.waitlistPosition}).`,
      REJECTED: 'We are unable to offer a seat this time.',
    } as Record<string, string>;
    await this.notifier.notify(row, 'Admission decision', message[status]);
    return this.done('application.decide', before, row, dto);
  }

  async offerFromWaitlist(user: AuthUser, scope: Scope, id: string) {
    const before = await this.access.loadIn(scope, id, ['WAITLISTED']);
    const row = await this.prisma.admissionApplication.update({
      where: { id },
      data: {
        status: 'OFFERED',
        waitlistPosition: null,
        decidedById: user.id,
        decidedAt: new Date(),
        updatedById: user.id,
      },
      include: APPLICATION_INCLUDE,
    });
    await this.notifier.notify(
      row,
      'Seat offered',
      'A seat is now available. Please confirm with the school office.',
    );
    return this.done('application.waitlist_offer', before, row, {});
  }

  private async done(
    action: string,
    before: ApplicationRow,
    row: ApplicationRow,
    input: object,
  ): Promise<ApplicationDto> {
    this.audit.stage({
      action,
      entityType: 'AdmissionApplication',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: { status: before.status },
      after: {
        status: row.status,
        waitlistPosition: row.waitlistPosition,
        ...input,
      },
    });
    return this.access.toDto(row);
  }
}
