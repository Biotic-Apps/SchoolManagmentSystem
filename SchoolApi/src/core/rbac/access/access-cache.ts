import { Injectable } from '@nestjs/common';
import { CacheStore } from '../../cache/cache-store';
import { isValidAt, type ActiveAssignment } from './active-assignment';
import { AssignmentRepository } from './assignment.repository';

const TTL_SECONDS = 300;
const ASSIGNMENTS = 'auth:assignments:';
const ROLE_PERMISSIONS = 'auth:role-perms:';
const GUARDIAN_STUDENTS = 'auth:guardian-students:';

/** Cached assignments and role permissions; invalidated on every change. */
@Injectable()
export class AccessCache {
  constructor(
    private readonly cache: CacheStore,
    private readonly repository: AssignmentRepository,
  ) {}

  async assignments(userId: string): Promise<ActiveAssignment[]> {
    const all = await this.cache.getOrLoad(
      ASSIGNMENTS + userId,
      TTL_SECONDS,
      () => this.repository.loadCurrent(userId),
    );
    const now = Date.now();
    return all.filter((assignment) => isValidAt(assignment, now));
  }

  rolePermissions(roleId: string): Promise<string[]> {
    return this.cache.getOrLoad(ROLE_PERMISSIONS + roleId, TTL_SECONDS, () =>
      this.repository.permissionsOfRole(roleId),
    );
  }

  /** Students reachable through VERIFIED guardian links. */
  guardianStudents(userId: string): Promise<string[]> {
    return this.cache.getOrLoad(GUARDIAN_STUDENTS + userId, TTL_SECONDS, () =>
      this.repository.verifiedStudentIds(userId),
    );
  }

  invalidateUser(userId: string): Promise<void> {
    return this.cache.del(ASSIGNMENTS + userId, GUARDIAN_STUDENTS + userId);
  }

  async invalidateAllUsers(): Promise<void> {
    await this.cache.delByPrefix(GUARDIAN_STUDENTS);
    return this.cache.delByPrefix(ASSIGNMENTS);
  }

  invalidateRole(roleId: string): Promise<void> {
    return this.cache.del(ROLE_PERMISSIONS + roleId);
  }
}
