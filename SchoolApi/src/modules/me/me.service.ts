import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { normalizePhone } from '../../core/auth/identifier';
import type { AuthUser } from '../../core/common/types/auth-user';
import { AccessCache } from '../../core/rbac/access/access-cache';
import { toAssignmentDto } from '../users/assignment.mapper';
import type { MeDto, MeUserDto } from './dto/me.dto';
import type { UpdateMeDto } from './dto/update-me.dto';
import { MeRepository } from './me.repository';

@Injectable()
export class MeService {
  constructor(
    private readonly repository: MeRepository,
    private readonly access: AccessCache,
    private readonly audit: AuditService,
  ) {}

  async get(user: AuthUser): Promise<MeDto> {
    const [profile, assignments] = await Promise.all([
      this.repository.findUser(user.id),
      this.access.assignments(user.id),
    ]);
    return {
      user: profile,
      activeRole: user.activeRole,
      roles: user.roles,
      permissions: [...user.permissions].sort(),
      assignments: assignments.map(toAssignmentDto),
      children: [],
    };
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
