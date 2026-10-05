import { Injectable } from '@nestjs/common';
import { REASSIGN_APPROVALS_JOB } from '../../../core/approvals/jobs/reassign-approvals.processor';
import { AuditService } from '../../../core/audit/audit.service';
import { SessionsService } from '../../../core/auth/sessions/sessions.service';
import { forbidden, invalid } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { JobDispatcher } from '../../../core/jobs/job-dispatcher';
import { QUEUES } from '../../../core/jobs/queues';
import { NotificationService } from '../../../core/notifications/notification.service';
import { AccessCache } from '../../../core/rbac/access/access-cache';
import { isSuperAdmin } from '../../../core/rbac/actor';
import type { Scope } from '../../../core/rbac/scope/scope';
import { toBranchDto } from '../branch.mapper';
import { BranchesService } from '../branches.service';
import type { BranchDto } from '../dto/branch.dto';
import { PrincipalRepository } from './principal.repository';

/** backendFlows.md §1.2 principal change. */
@Injectable()
export class PrincipalService {
  constructor(
    private readonly branches: BranchesService,
    private readonly repository: PrincipalRepository,
    private readonly sessions: SessionsService,
    private readonly access: AccessCache,
    private readonly jobs: JobDispatcher,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async change(
    user: AuthUser,
    scope: Scope,
    branchId: string,
    userId: string,
  ): Promise<BranchDto> {
    if (!isSuperAdmin(user))
      throw forbidden('Only Super Admin can change a principal');
    const branch = await this.branches.find(scope, branchId);
    const principal = await this.repository.findActiveUser(userId);
    if (!principal) throw invalid('User does not exist or is disabled');

    const previous = await this.repository.replace(branch, userId, user.id);
    await this.access.invalidateUser(userId);
    for (const oldId of previous) {
      await this.access.invalidateUser(oldId);
      await this.sessions.revokeAllForUser(oldId, { bumpTokenVersion: true });
      await this.jobs.dispatch(QUEUES.MAINTENANCE, REASSIGN_APPROVALS_JOB, {
        branchId,
        fromUserId: oldId,
        toUserId: userId,
      });
    }
    await this.notifications.notify({
      userIds: [userId],
      category: 'ROLE',
      title: 'Principal assignment',
      body: `You are now the principal of ${branch.name}.`,
      data: { branchId },
    });
    await this.notifications.notify({
      userIds: previous,
      category: 'ROLE',
      title: 'Principal assignment ended',
      body: `Your principal assignment for ${branch.name} has ended.`,
      data: { branchId },
    });
    this.audit.stage({
      action: 'branch.principal_change',
      entityType: 'Branch',
      entityId: branchId,
      schoolId: branch.schoolId,
      branchId,
      before: { principalUserId: branch.principalUserId },
      after: { principalUserId: userId, endedFor: previous },
    });
    return toBranchDto(await this.branches.find(scope, branchId));
  }
}
