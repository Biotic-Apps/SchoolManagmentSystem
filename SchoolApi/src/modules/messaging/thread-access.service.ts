import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { forbidden, notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import { isSuperAdmin } from '../../core/rbac/actor';
import { RoleKey } from '../../core/rbac/role-key.enum';
import type { Scope } from '../../core/rbac/scope/scope';
import { THREAD_INCLUDE, type ThreadRow } from './thread.mapper';

const BRANCH_READERS = new Set<string>([
  RoleKey.PRINCIPAL,
  RoleKey.COORDINATOR,
  RoleKey.HEAD_TEACHER,
]);

export type ThreadParticipantRow = ThreadRow['participants'][number];

/** Participants use a thread; branch management may read it (audited). */
@Injectable()
export class ThreadAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  canBranchView(user: AuthUser, scope: Scope): boolean {
    if (isSuperAdmin(user)) return true;
    return (
      BRANCH_READERS.has(user.activeRole) &&
      !scope.guardian &&
      !scope.sectionLimited
    );
  }

  assertBranchView(user: AuthUser, scope: Scope): void {
    if (!this.canBranchView(user, scope))
      throw forbidden('Branch view is for principals and coordinators');
  }

  /** `participant` is null for an audited management read. */
  async load(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<{ row: ThreadRow; participant: ThreadParticipantRow | null }> {
    const row = await this.prisma.messageThread.findUnique({
      where: { id },
      include: THREAD_INCLUDE,
    });
    if (!row) throw notFound('Thread');
    const participant = row.participants.find((p) => p.userId === user.id);
    if (participant) return { row, participant };
    const manages = scope.canManageBranch({
      id: row.branchId,
      schoolId: row.schoolId,
    });
    if (!manages || !this.canBranchView(user, scope)) throw notFound('Thread');
    await this.audit.recordNow({
      action: 'messages.branch_view',
      entityType: 'MessageThread',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
    });
    return { row, participant: null };
  }

  async participantOf(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<{ row: ThreadRow; participant: ThreadParticipantRow }> {
    const { row, participant } = await this.load(user, scope, id);
    if (!participant) throw forbidden('Branch view is read-only');
    return { row, participant };
  }
}
