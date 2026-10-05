import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import {
  conflict,
  forbidden,
  invalid,
  notFound,
} from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { AccessCache } from '../../core/rbac/access/access-cache';
import { isSuperAdmin } from '../../core/rbac/actor';
import { PERMISSION_CATALOGUE } from '../../core/rbac/permission-catalogue';
import type { Scope } from '../../core/rbac/scope/scope';
import type { CreateRoleDto } from './dto/create-role.dto';
import type { RoleDto } from './dto/role.dto';
import type { UpdateRoleDto } from './dto/update-role.dto';
import { customRoleKey } from './role-key';
import { toRoleDto } from './role.mapper';
import { RolesRepository, type RoleWithPermissions } from './roles.repository';

const CATALOGUE = new Set<string>(PERMISSION_CATALOGUE);

@Injectable()
export class RolesService {
  constructor(
    private readonly repository: RolesRepository,
    private readonly access: AccessCache,
    private readonly audit: AuditService,
  ) {}

  async list(scope: Scope): Promise<RoleDto[]> {
    const roles = await this.repository.list(scope);
    const counts = await this.repository.activeAssignmentCounts(
      roles.map((r) => r.id),
    );
    return roles.map((role) => toRoleDto(role, counts.get(role.id) ?? 0));
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateRoleDto,
  ): Promise<RoleDto> {
    if (dto.schoolId) scope.assertManageSchool(dto.schoolId);
    else if (!isSuperAdmin(user))
      throw forbidden('Only Super Admin can create global roles');
    this.assertGrantable(user, dto.permissions);

    const key = customRoleKey(dto.name);
    const role = await this.repository
      .create({
        key,
        name: dto.name.trim(),
        schoolId: dto.schoolId ?? null,
        permissions: dto.permissions,
        actorId: user.id,
      })
      .catch((error: { code?: string }) => {
        if (error.code === 'P2002')
          throw conflict(`Role ${key} already exists`);
        throw error;
      });
    this.audit.stage({
      action: 'role.create',
      entityType: 'Role',
      entityId: role.id,
      schoolId: role.schoolId,
      after: toRoleDto(role, 0),
    });
    return toRoleDto(role, 0);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateRoleDto,
  ): Promise<RoleDto> {
    const role = await this.editable(user, scope, id);
    if (dto.permissions) this.assertGrantable(user, dto.permissions);
    const updated = await this.repository.update(id, {
      name: dto.name?.trim(),
      permissions: dto.permissions,
      actorId: user.id,
    });
    await this.access.invalidateRole(id);
    const count =
      (await this.repository.activeAssignmentCounts([id])).get(id) ?? 0;
    this.audit.stage({
      action: 'role.update',
      entityType: 'Role',
      entityId: id,
      schoolId: role.schoolId,
      before: toRoleDto(role, count),
      after: toRoleDto(updated, count),
    });
    return toRoleDto(updated, count);
  }

  async remove(user: AuthUser, scope: Scope, id: string): Promise<void> {
    const role = await this.editable(user, scope, id);
    if (role.isSystem) throw forbidden('System roles cannot be deleted');
    const count =
      (await this.repository.activeAssignmentCounts([id])).get(id) ?? 0;
    if (count > 0) throw conflict('Role still has active assignments');
    await this.repository.remove(id);
    await this.access.invalidateRole(id);
    this.audit.stage({
      action: 'role.delete',
      entityType: 'Role',
      entityId: id,
      schoolId: role.schoolId,
      before: toRoleDto(role, 0),
    });
  }

  private async editable(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<RoleWithPermissions> {
    const role = await this.repository.findById(id);
    if (!role) throw notFound('Role');
    if (role.isSystem || role.schoolId === null) {
      if (!isSuperAdmin(user))
        throw forbidden('Only Super Admin can edit this role');
    } else {
      scope.assertManageSchool(role.schoolId);
    }
    return role;
  }

  /** Permissions must exist, and non-super-admins may only pass on what they hold. */
  private assertGrantable(user: AuthUser, permissions: string[]): void {
    const unknown = permissions.filter((p) => !CATALOGUE.has(p));
    if (unknown.length > 0) throw invalid('Unknown permissions', { unknown });
    if (isSuperAdmin(user)) return;
    const notHeld = permissions.filter((p) => !user.permissions.has(p));
    if (notHeld.length > 0)
      throw forbidden('You cannot grant permissions you do not hold');
  }
}
