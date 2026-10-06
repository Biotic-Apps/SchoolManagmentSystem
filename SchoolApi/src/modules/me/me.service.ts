import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { UserAuthPolicyService } from '../../core/auth/policy/user-auth-policy.service';
import { TwoFactorService } from '../../core/auth/two-factor/two-factor.service';
import { normalizePhone } from '../../core/auth/identifier';
import type { AuthUser } from '../../core/common/types/auth-user';
import { UrlSigner } from '../../core/files/url-signer';
import { AccessCache } from '../../core/rbac/access/access-cache';
import { RoleKey } from '../../core/rbac/role-key.enum';
import { toAssignmentDto } from '../users/assignment.mapper';
import type { MeChildDto, MeDto, MeUserDto } from './dto/me.dto';
import type { UpdateMeDto } from './dto/update-me.dto';
import { MeRepository } from './me.repository';

@Injectable()
export class MeService {
  constructor(
    private readonly repository: MeRepository,
    private readonly access: AccessCache,
    private readonly signer: UrlSigner,
    private readonly audit: AuditService,
    private readonly twoFactor: TwoFactorService,
    private readonly policies: UserAuthPolicyService,
  ) {}

  async get(user: AuthUser): Promise<MeDto> {
    const [profile, assignments, twoFactor, policies] = await Promise.all([
      this.repository.findUser(user.id),
      this.access.assignments(user.id),
      this.twoFactor.status(user.id),
      this.policies.forUser(user.id),
    ]);
    return {
      user: {
        ...profile,
        twoFactorEnabled: twoFactor.enabled,
        twoFactorRequired: twoFactor.required,
      },
      twoFactor,
      sessionTimeoutMinutes: policies.sessionTimeoutMinutes,
      activeRole: user.activeRole,
      roles: user.roles,
      permissions: [...user.permissions].sort(),
      assignments: assignments.map(toAssignmentDto),
      children: user.roles.includes(RoleKey.PARENT)
        ? await this.children(user.id)
        : [],
    };
  }

  private async children(userId: string): Promise<MeChildDto[]> {
    const rows = await this.repository.children(userId);
    return rows.map((row) => {
      const e = row.enrollments[0];
      return {
        id: row.id,
        name: `${row.firstName} ${row.lastName}`.trim(),
        admissionNo: row.admissionNo,
        photoUrl: row.photoFileId
          ? this.signer.sign(row.photoFileId).url
          : null,
        className: e?.section.schoolClass.name ?? '',
        sectionName: e?.section.name ?? '',
        branchName: e?.branch.name ?? '',
        sessionName: e?.session.name ?? '',
      };
    });
  }

  async update(user: AuthUser, dto: UpdateMeDto): Promise<MeUserDto> {
    const before = await this.repository.findUser(user.id);
    const after = await this.repository.updateUser(user.id, {
      name: dto.name?.trim(),
      email: dto.email?.toLowerCase(),
      phone: dto.phone ? normalizePhone(dto.phone) : undefined,
    });
    this.audit.stage({
      action: 'user.update_self',
      entityType: 'User',
      entityId: user.id,
      before,
      after,
    });
    return after;
  }
}
