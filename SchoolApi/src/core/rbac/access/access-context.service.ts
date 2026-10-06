import { Injectable } from '@nestjs/common';
import { forbidden } from '../../common/errors/errors';
import { sortRoleKeys } from '../role-priority';
import { AccessCache } from './access-cache';
import type { ActiveAssignment } from './active-assignment';

export interface AccessContext {
  activeRole: string;
  roles: string[];
  permissions: Set<string>;
  assignments: ActiveAssignment[];
  allAssignments: ActiveAssignment[];
  studentIds: string[];
}

@Injectable()
export class AccessContextService {
  constructor(private readonly cache: AccessCache) {}

  /** Picks the active role (header or highest priority) and its permissions. */
  async resolve(
    userId: string,
    requestedRole?: string,
  ): Promise<AccessContext> {
    const allAssignments = await this.cache.assignments(userId);
    const roles = sortRoleKeys(allAssignments.map((a) => a.roleKey));
    if (roles.length === 0) throw forbidden('No active role assignment');

    const activeRole = requestedRole || roles[0];
    if (!roles.includes(activeRole)) {
      throw forbidden(`Role ${activeRole} is not assigned to you`);
    }

    const assignments = allAssignments.filter((a) => a.roleKey === activeRole);
    const roleIds = [...new Set(assignments.map((a) => a.roleId))];
    const lists = await Promise.all(
      roleIds.map((id) => this.cache.rolePermissions(id)),
    );
    const studentIds = assignments.some((a) => a.scopeType === 'GUARDIAN')
      ? await this.cache.guardianStudents(userId)
      : [];
    return {
      activeRole,
      studentIds,
      roles,
      permissions: new Set(lists.flat()),
      assignments,
      allAssignments,
    };
  }
}
