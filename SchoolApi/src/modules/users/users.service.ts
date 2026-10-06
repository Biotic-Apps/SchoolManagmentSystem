import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { normalizePhone } from '../../core/auth/identifier';
import { PasswordHasher } from '../../core/auth/password/password-hasher';
import { PasswordPolicyService } from '../../core/auth/password/password-policy.service';
import { schoolIdsOf } from '../../core/auth/policy/user-auth-policy.service';
import { generateTemporaryPassword } from '../../core/auth/password/temporary-password';
import { forbidden, invalid, notFound } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import { toPageResult } from '../../core/common/pagination/paginate';
import type { AuthUser } from '../../core/common/types/auth-user';
import { isSuperAdmin } from '../../core/rbac/actor';
import type { Scope } from '../../core/rbac/scope/scope';
import { AssignmentResolver } from './assignment-resolver';
import type { CreateUserDto } from './dto/create-user.dto';
import type {
  CreatedUserDto,
  UserDetailDto,
  UserSummaryDto,
} from './dto/user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { UserQueryDto } from './dto/user-query.dto';
import { assertCanGrant } from './grant-rules';
import { UserAccessService } from './user-access.service';
import { toUserDetail, toUserSummary } from './user.mapper';
import { UsersRepository, type UserRow } from './users.repository';

const contact = (dto: { email?: string; phone?: string }) => ({
  email: dto.email?.toLowerCase(),
  phone: dto.phone ? normalizePhone(dto.phone) : undefined,
});

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly resolver: AssignmentResolver,
    private readonly hasher: PasswordHasher,
    private readonly userAccess: UserAccessService,
    private readonly audit: AuditService,
    private readonly passwordPolicy: PasswordPolicyService,
  ) {}

  async list(
    scope: Scope,
    query: UserQueryDto,
  ): Promise<PageResult<UserSummaryDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(rows.map(toUserSummary), total, query);
  }

  async get(scope: Scope, id: string): Promise<UserDetailDto> {
    return toUserDetail(await this.find(scope, id));
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateUserDto,
  ): Promise<CreatedUserDto> {
    if (!dto.email && !dto.phone) throw invalid('email or phone is required');
    const resolved = await Promise.all(
      dto.assignments.map((a) => this.resolver.resolve(a, user.id)),
    );
    const actor = { userId: user.id, isSuperAdmin: isSuperAdmin(user), scope };
    resolved.forEach((r) =>
      assertCanGrant(actor, { ...r.target, targetUserId: '' }),
    );

    const generated = !dto.password;
    const password = dto.password ?? generateTemporaryPassword();
    // A chosen password must meet the policy of the schools it is created in;
    // a generated one is temporary (mustChangePassword) and meets the baseline.
    if (dto.password) {
      await this.passwordPolicy.assertForSchools(
        schoolIdsOf(resolved.map((r) => r.target)),
        dto.password,
      );
    }
    const row = await this.repository.create(
      {
        name: dto.name.trim(),
        ...contact(dto),
        passwordHash: await this.hasher.hash(password),
        mustChangePassword: true,
        createdById: user.id,
      },
      resolved.map((r) => r.data),
    );
    const detail = toUserDetail(row);
    this.audit.stage({
      action: 'user.create',
      entityType: 'User',
      entityId: row.id,
      schoolId: resolved[0].target.schoolId,
      branchId: resolved[0].target.branchId,
      after: detail,
    });
    return { ...detail, ...(generated && { temporaryPassword: password }) };
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateUserDto,
  ): Promise<UserDetailDto> {
    const before = await this.find(scope, id);
    const row = await this.repository.update(id, {
      name: dto.name?.trim(),
      ...contact(dto),
      updatedById: user.id,
    });
    return this.audited('user.update', before, row);
  }

  async setStatus(
    user: AuthUser,
    scope: Scope,
    id: string,
    status: 'ACTIVE' | 'DISABLED',
  ): Promise<UserDetailDto> {
    if (id === user.id) throw forbidden('You cannot change your own status');
    const before = await this.find(scope, id);
    const row = await this.repository.update(id, {
      status,
      updatedById: user.id,
    });
    if (status === 'DISABLED') await this.userAccess.revokeEverything(id);
    else await this.userAccess.refreshAssignments(id);
    return this.audited(
      status === 'DISABLED' ? 'user.disable' : 'user.enable',
      before,
      row,
    );
  }

  async resetPassword(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<{ temporaryPassword: string }> {
    if (id === user.id)
      throw forbidden('Use password change for your own account');
    await this.find(scope, id);
    const temporaryPassword = generateTemporaryPassword();
    await this.repository.update(id, {
      passwordHash: await this.hasher.hash(temporaryPassword),
      mustChangePassword: true,
      failedLoginCount: 0,
      lockedUntil: null,
      updatedById: user.id,
    });
    await this.userAccess.revokeEverything(id);
    this.audit.stage({
      action: 'user.reset_password',
      entityType: 'User',
      entityId: id,
    });
    return { temporaryPassword };
  }

  /** Clears a sign-in lockout (failed attempts and lockedUntil). */
  async unlock(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<UserDetailDto> {
    if (id === user.id) throw forbidden('You cannot unlock your own account');
    const before = await this.find(scope, id);
    const row = await this.repository.update(id, {
      failedLoginCount: 0,
      lockedUntil: null,
      updatedById: user.id,
    });
    return this.audited('user.unlock', before, row);
  }

  async find(scope: Scope, id: string): Promise<UserRow> {
    const row = await this.repository.findVisible(scope, id);
    if (!row) throw notFound('User');
    return row;
  }

  private audited(
    action: string,
    before: UserRow,
    after: UserRow,
  ): UserDetailDto {
    const detail = toUserDetail(after);
    this.audit.stage({
      action,
      entityType: 'User',
      entityId: after.id,
      before: toUserDetail(before),
      after: detail,
    });
    return detail;
  }
}
