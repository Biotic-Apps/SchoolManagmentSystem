import { Injectable } from '@nestjs/common';
import { AccountProvisioner } from '../../../core/accounts/account-provisioner';
import { AuditService } from '../../../core/audit/audit.service';
import { normalizePhone } from '../../../core/auth/identifier';
import { PasswordPolicyService } from '../../../core/auth/password/password-policy.service';
import {
  conflict,
  forbidden,
  invalid,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { UsersService } from '../../users/users.service';
import { StaffAccessService } from '../staff-access.service';
import type {
  CreateStaffAccountDto,
  StaffAccountDto,
  StaffPasswordResetDto,
} from './staff-account.dto';
import { staffRoleFor } from './staff-role';

/** Sign-in accounts for staff created without one, and admin password resets. */
@Injectable()
export class StaffAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: StaffAccessService,
    private readonly accounts: AccountProvisioner,
    private readonly passwordPolicy: PasswordPolicyService,
    private readonly users: UsersService,
    private readonly audit: AuditService,
  ) {}

  async create(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: CreateStaffAccountDto,
  ): Promise<StaffAccountDto> {
    if (!user.permissions.has('users.add')) throw forbidden();
    const staff = await this.access.manage(scope, id);
    if (staff.userId) throw conflict('This staff member already has a login');
    const email = (dto.email ?? staff.email)?.trim().toLowerCase() || null;
    const phone = dto.phone ? normalizePhone(dto.phone) : staff.phone;
    if (!email && !phone)
      throw invalid('An email or phone is needed to sign in');
    if (dto.password)
      await this.passwordPolicy.assertForSchools(
        [staff.schoolId],
        dto.password,
      );
    const roleKey = staffRoleFor(staff.designation, dto.roleKey);

    const account = await this.prisma.$transaction(async (tx) => {
      const provisioned = await this.accounts.provision(tx, {
        name: staff.name,
        email,
        phone,
        roleKey,
        scopeType: 'BRANCH',
        schoolId: staff.schoolId,
        branchId: staff.branchId,
        grantedById: user.id,
        password: dto.password,
      });
      if ((await tx.staff.count({ where: { userId: provisioned.userId } })) > 0)
        throw conflict('That login already has a staff record');
      const linked = await tx.staff.updateMany({
        where: { id, userId: null },
        data: {
          userId: provisioned.userId,
          email: staff.email ?? email,
          phone: staff.phone ?? phone,
          updatedById: user.id,
        },
      });
      if (linked.count === 0)
        throw conflict('This staff member already has a login');
      return provisioned;
    });
    await this.accounts.refresh(account.userId);
    this.audit.stage({
      action: 'staff.account.create',
      entityType: 'Staff',
      entityId: id,
      schoolId: staff.schoolId,
      branchId: staff.branchId,
      after: {
        userId: account.userId,
        email,
        phone,
        roleKey,
        accountCreated: account.created,
        passwordSetByAdmin: Boolean(dto.password) && account.created,
      },
    });
    return {
      userId: account.userId,
      email,
      phone,
      ...(account.temporaryPassword && {
        temporaryPassword: account.temporaryPassword,
      }),
    };
  }

  async resetPassword(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<StaffPasswordResetDto> {
    if (!user.permissions.has('users.edit')) throw forbidden();
    const staff = await this.access.manage(scope, id);
    if (!staff.userId) throw invalid('This staff member has no login yet');
    const { temporaryPassword } = await this.users.resetPassword(
      user,
      scope,
      staff.userId,
    );
    this.audit.stage({
      action: 'staff.account.reset_password',
      entityType: 'Staff',
      entityId: id,
      schoolId: staff.schoolId,
      branchId: staff.branchId,
      after: { userId: staff.userId },
    });
    return { userId: staff.userId, temporaryPassword };
  }
}
