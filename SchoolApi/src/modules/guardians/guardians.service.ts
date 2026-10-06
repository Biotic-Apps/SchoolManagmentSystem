import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AccountProvisioner } from '../../core/accounts/account-provisioner';
import { AuditService } from '../../core/audit/audit.service';
import { normalizePhone } from '../../core/auth/identifier';
import { conflict } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../core/common/pagination/paginate';
import { containsInsensitive } from '../../core/common/search';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RoleKey } from '../../core/rbac/role-key.enum';
import type { Scope } from '../../core/rbac/scope/scope';
import type { GuardianDto } from '../students/dto/student.dto';
import { toGuardianDto } from '../students/guardian.mapper';
import { fullName } from '../students/student.mapper';
import {
  currentEnrollment,
  studentScopeWhere,
} from '../students/student-scope';
import type { GuardianAccountDto, GuardianDetailDto } from './dto/guardian.dto';
import type {
  GuardianQueryDto,
  UpdateGuardianDto,
} from './dto/guardian-input.dto';
import {
  GuardianAccessService,
  type GuardianAccessRow,
} from './guardian-access.service';

@Injectable()
export class GuardiansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: GuardianAccessService,
    private readonly accounts: AccountProvisioner,
    private readonly audit: AuditService,
  ) {}

  async list(
    user: AuthUser,
    scope: Scope,
    query: GuardianQueryDto,
  ): Promise<PageResult<GuardianDto>> {
    const search = containsInsensitive(query.search);
    const where: Prisma.GuardianWhereInput = {
      AND: [
        scope.global
          ? {}
          : {
              studentLinks: {
                some: {
                  status: { in: ['VERIFIED', 'REQUESTED'] },
                  student: studentScopeWhere(scope),
                },
              },
            },
        query.branchId
          ? {
              studentLinks: {
                some: {
                  student: {
                    enrollments: {
                      some: { branchId: query.branchId, status: 'ACTIVE' },
                    },
                  },
                },
              },
            }
          : {},
        search
          ? { OR: [{ name: search }, { phone: search }, { email: search }] }
          : {},
        { status: 'ACTIVE' },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.guardian.findMany({
        where,
        orderBy: { name: 'asc' },
        ...toSkipTake(query),
      }),
      this.prisma.guardian.count({ where }),
    ]);
    const sensitive = user.permissions.has('people.sensitive.view');
    return toPageResult(
      rows.map((r) => toGuardianDto(r, sensitive)),
      total,
      query,
    );
  }

  async get(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<GuardianDetailDto> {
    return this.detail(user, await this.access.read(scope, id));
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateGuardianDto,
  ): Promise<GuardianDetailDto> {
    const before = await this.access.manage(scope, id);
    await this.prisma.guardian.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        relation: dto.relation,
        cnic: dto.cnic,
        phone: dto.phone ? normalizePhone(dto.phone) : undefined,
        email: dto.email?.toLowerCase(),
        occupation: dto.occupation,
        address: dto.address,
        updatedById: user.id,
      },
    });
    const after = await this.access.read(scope, id);
    this.audit.stage({
      action: 'guardian.update',
      entityType: 'Guardian',
      entityId: id,
      schoolId: before.schoolId,
      before: toGuardianDto(before, true),
      after: toGuardianDto(after, true),
    });
    return this.detail(user, after);
  }

  async createAccount(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<GuardianAccountDto> {
    const guardian = await this.access.manage(scope, id);
    if (guardian.userId) throw conflict('Guardian already has an account');
    const result = await this.prisma.$transaction(async (tx) => {
      const account = await this.accounts.provision(tx, {
        name: guardian.name,
        email: guardian.email,
        phone: guardian.phone,
        roleKey: RoleKey.PARENT,
        scopeType: 'GUARDIAN',
        schoolId: guardian.schoolId,
        grantedById: user.id,
      });
      const taken = await tx.guardian.count({
        where: { userId: account.userId },
      });
      if (taken > 0)
        throw conflict('That login already belongs to another guardian');
      await tx.guardian.update({
        where: { id },
        data: { userId: account.userId },
      });
      return account;
    });
    await this.accounts.refresh(result.userId);
    this.audit.stage({
      action: 'guardian.account_create',
      entityType: 'Guardian',
      entityId: id,
      schoolId: guardian.schoolId,
      after: { userId: result.userId, created: result.created },
    });
    return {
      userId: result.userId,
      temporaryPassword: result.temporaryPassword,
    };
  }

  private detail(user: AuthUser, row: GuardianAccessRow): GuardianDetailDto {
    return {
      ...toGuardianDto(row, user.permissions.has('people.sensitive.view')),
      children: row.studentLinks.map((link) => {
        const e = currentEnrollment(link.student.enrollments);
        return {
          linkId: link.id,
          studentId: link.studentId,
          name: fullName(link.student),
          className: e?.section.schoolClass.name ?? null,
          sectionName: e?.section.name ?? null,
          relation: link.relation,
          status: link.status,
        };
      }),
    };
  }
}
