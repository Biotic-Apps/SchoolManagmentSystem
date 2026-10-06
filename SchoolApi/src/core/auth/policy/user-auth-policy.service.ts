import { Injectable } from '@nestjs/common';
import { CacheStore } from '../../cache/cache-store';
import { AccessCache } from '../../rbac/access/access-cache';
import type { ActiveAssignment } from '../../rbac/access/active-assignment';
import { SchoolSettingsReader } from '../../school-settings/school-settings.reader';

type Placed = Pick<ActiveAssignment, 'scopeType' | 'schoolId' | 'roleKey'>;

const REQUIRED = 'auth:2fa-required:';
const REQUIRED_TTL = 60;

/** Schools of a set of assignments; `null` = every school (GLOBAL scope). */
export function schoolIdsOf(
  assignments: Pick<Placed, 'scopeType' | 'schoolId'>[],
): string[] | null {
  if (assignments.some((a) => a.scopeType === 'GLOBAL')) return null;
  return [
    ...new Set(
      assignments.map((a) => a.schoolId).filter((id): id is string => !!id),
    ),
  ];
}

/**
 * School auth policies (password, idle timeout, 2FA) as they apply to one
 * user: the strictest over the schools of their current assignments.
 */
@Injectable()
export class UserAuthPolicyService {
  constructor(
    private readonly access: AccessCache,
    private readonly settings: SchoolSettingsReader,
    private readonly cache: CacheStore,
  ) {}

  async forUser(userId: string) {
    const assignments = await this.access.assignments(userId);
    return this.settings.authPolicies(schoolIdsOf(assignments));
  }

  forSchools(schoolIds: string[] | null) {
    return this.settings.authPolicies(schoolIds);
  }

  /** True when a role the user holds is in its school's twoFactorRequiredFor. */
  twoFactorRequired(userId: string, assignments?: Placed[]): Promise<boolean> {
    return this.cache.getOrLoad(REQUIRED + userId, REQUIRED_TTL, async () => {
      const list = assignments ?? (await this.access.assignments(userId));
      for (const assignment of list) {
        const ids =
          assignment.scopeType === 'GLOBAL'
            ? null
            : assignment.schoolId
              ? [assignment.schoolId]
              : [];
        if (ids?.length === 0) continue;
        const policy = await this.settings.authPolicies(ids);
        const roles: readonly string[] = policy.twoFactorRequiredFor;
        if (roles.includes(assignment.roleKey)) return true;
      }
      return false;
    });
  }

  invalidateUser(userId: string): Promise<void> {
    return this.cache.del(REQUIRED + userId);
  }
}
