import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../../core/approvals/approval.service';
import { AuditService } from '../../core/audit/audit.service';
import { formatDate } from '../../core/common/dates';
import { conflict, notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { ClientRequestService } from '../../core/idempotency/client-request.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ProbationGate } from '../../core/probation/probation-gate';
import { RoleKey } from '../../core/rbac/role-key.enum';
import type { Scope } from '../../core/rbac/scope/scope';
import { BranchSettingsReader } from '../branches/settings/branch-settings.reader';
import { DiaryAccessService } from './diary-access.service';
import {
  DiaryPublishAction,
  DIARY_PUBLISH_ACTION,
  type DiaryPublishPayload,
} from './diary-publish.action';
import { DiaryService } from './diary.service';
import type { DiaryEntryDto } from './dto/diary.dto';

/**
 * Publish (P)(X)(O): with branch `diary.moderation` it goes to a
 * DIARY_MODERATION approval; a probation teacher's goes to their reviewer.
 */
@Injectable()
export class DiaryPublishService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: DiaryAccessService,
    private readonly diary: DiaryService,
    private readonly action: DiaryPublishAction,
    private readonly gate: ProbationGate,
    private readonly approvals: ApprovalService,
    private readonly settings: BranchSettingsReader,
    private readonly requests: ClientRequestService,
    private readonly audit: AuditService,
  ) {}

  async publish(
    user: AuthUser,
    scope: Scope,
    id: string,
    clientRequestId?: string,
  ): Promise<DiaryEntryDto> {
    const entry = await this.prisma.diaryEntry.findUnique({ where: { id } });
    if (!entry) throw notFound('Diary entry');
    const actor = await this.access.writer(
      user,
      scope,
      entry.sectionId,
      entry.subjectId,
    );
    const key = { userId: user.id, clientRequestId, action: 'diary.publish' };
    if ((await this.requests.seen(key)) !== undefined)
      return this.diary.get(id);
    if (!['DRAFT', 'RETURNED'].includes(entry.status))
      throw conflict(`The entry is ${entry.status.toLowerCase()}`);

    const moderated = await this.settings.get<boolean>(
      entry.branchId,
      'diary.moderation',
    );
    const title = `Diary ${formatDate(entry.date)}`;
    if (moderated) {
      await this.prisma.$transaction(async (tx) => {
        const approval = await this.approvals.create(
          {
            type: 'DIARY_MODERATION',
            entityType: 'DiaryEntry',
            entityId: id,
            schoolId: entry.schoolId,
            branchId: entry.branchId,
            requestedById: user.id,
            title,
            payload: { entryId: id },
            steps: [{ approverRole: RoleKey.PRINCIPAL }],
          },
          tx,
        );
        await tx.diaryEntry.update({
          where: { id },
          data: { status: 'SUBMITTED', approvalId: approval.id },
        });
      });
    } else {
      const payload: DiaryPublishPayload = { entryId: id };
      await this.gate.run(
        { userId: user.id, onBehalfOfStaffId: actor.onBehalfOfStaffId },
        {
          key: DIARY_PUBLISH_ACTION,
          entityType: 'DiaryEntry',
          entityId: id,
          schoolId: entry.schoolId,
          branchId: entry.branchId,
          title,
          payload,
        },
        () =>
          this.prisma.$transaction((tx) =>
            this.action.apply(
              payload,
              {
                performedById: user.id,
                onBehalfOfStaffId: actor.onBehalfOfStaffId,
              },
              tx,
            ),
          ),
      );
    }
    await this.prisma.$transaction((tx) => this.requests.remember(tx, key, id));
    this.audit.stage({
      action: 'diary.publish_request',
      entityType: 'DiaryEntry',
      entityId: id,
      schoolId: entry.schoolId,
      branchId: entry.branchId,
      onBehalfOfStaffId: actor.onBehalfOfStaffId ?? undefined,
      before: { status: entry.status },
      after: { moderated },
    });
    return this.diary.get(id);
  }

  /** Supervisor returns an entry waiting for moderation or probation review. */
  async return(
    user: AuthUser,
    scope: Scope,
    id: string,
    comment: string,
  ): Promise<DiaryEntryDto> {
    const entry = await this.prisma.diaryEntry.findUnique({ where: { id } });
    if (!entry) throw notFound('Diary entry');
    scope.assertManageBranch({ id: entry.branchId, schoolId: entry.schoolId });
    if (
      !['SUBMITTED', 'PENDING_REVIEW'].includes(entry.status) ||
      !entry.approvalId
    )
      throw conflict('Only entries awaiting review can be returned');
    await this.approvals.decideAuthorized(user.id, entry.approvalId, {
      decision: 'RETURNED',
      comment,
    });
    await this.prisma.diaryEntry.update({
      where: { id },
      data: { status: 'RETURNED', comment },
    });
    this.audit.stage({
      action: 'diary.return',
      entityType: 'DiaryEntry',
      entityId: id,
      schoolId: entry.schoolId,
      branchId: entry.branchId,
      before: { status: entry.status },
      after: { status: 'RETURNED', comment },
    });
    return this.diary.get(id);
  }
}
