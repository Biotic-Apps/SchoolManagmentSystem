import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { forbidden, notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { isSuperAdmin } from '../../core/rbac/actor';
import type { Scope } from '../../core/rbac/scope/scope';
import { AssignmentResolver } from './assignment-resolver';
import type { AssignmentInputDto } from './dto/assignment-input.dto';
import type { UserDetailDto } from './dto/user.dto';
import { assertCanGrant } from './grant-rules';
import { UserAccessService } from './user-access.service';
import { toUserDetail } from './user.mapper';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly users: UsersService,
    private readonly repository: UsersRepository,
    private readonly resolver: AssignmentResolver,
    private readonly userAccess: UserAccessService,
    private readonly audit: AuditService,
  ) {}

  async add(
    user: AuthUser,
    scope: Scope,
    userId: string,
    input: AssignmentInputDto,
  ): Promise<UserDetailDto> {
    await this.findTarget(user, scope, userId);
    const resolved = await this.resolver.resolve(input, user.id);
    assertCanGrant(this.actor(user, scope), {
      ...resolved.target,
      targetUserId: userId,
    });

    const created = await this.repository.addAssignment({
      ...resolved.data,
      userId,
    });
    await this.userAccess.refreshAssignments(userId);
    this.audit.stage({
      action: 'user.assignment_add',
      entityType: 'User',
      entityId: userId,
      schoolId: created.schoolId,
      branchId: created.branchId,
      after: {
        assignmentId: created.id,
        role: resolved.target.roleKey,
        scopeType: created.scopeType,
      },
    });
    return this.detail(userId);
  }

  /** Ends the assignment (history kept) and revokes the user's sessions. */
  async remove(
    user: AuthUser,
    scope: Scope,
    userId: string,
    assignmentId: string,
  ): Promise<UserDetailDto> {
    await this.findTarget(user, scope, userId);
    const assignment = await this.repository.findAssignment(
      userId,
      assignmentId,
    );
    if (!assignment) throw notFound('Assignment');
    assertCanGrant(this.actor(user, scope), {
      targetUserId: userId,
      roleKey: assignment.role.key,
      roleSchoolId: assignment.role.schoolId,
      scopeType: assignment.scopeType,
      schoolId: assignment.schoolId,
      branchId: assignment.branchId,
    });
    await this.repository.endAssignment(assignmentId);
    await this.userAccess.revokeEverything(userId);
    this.audit.stage({
      action: 'user.assignment_end',
      entityType: 'User',
      entityId: userId,
      schoolId: assignment.schoolId,
      branchId: assignment.branchId,
      before: {
        assignmentId,
        role: assignment.role.key,
        scopeType: assignment.scopeType,
      },
    });
    return this.detail(userId);
  }

  private async findTarget(user: AuthUser, scope: Scope, userId: string) {
    if (userId === user.id)
      throw forbidden('You cannot change your own role assignments');
    return this.users.find(scope, userId);
  }

  private actor(user: AuthUser, scope: Scope) {
    return { userId: user.id, isSuperAdmin: isSuperAdmin(user), scope };
  }

  private async detail(userId: string): Promise<UserDetailDto> {
    const row = await this.repository.findById(userId);
    if (!row) throw notFound('User');
    return toUserDetail(row);
  }
}
