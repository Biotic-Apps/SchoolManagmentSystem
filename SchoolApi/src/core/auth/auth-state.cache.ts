import { Injectable } from '@nestjs/common';
import { CacheStore } from '../cache/cache-store';
import { RefreshSessionRepository } from './sessions/refresh-session.repository';
import {
  UserAccountRepository,
  type UserAuthState,
} from './user-account.repository';

const USER = 'auth:user:';
const FAMILY = 'auth:family:';
const USER_TTL = 300;
const FAMILY_TTL = 60;
const REVOKED_FAMILY_TTL = 15 * 60;

/** Per-request token checks (version, status, session) served from cache. */
@Injectable()
export class AuthStateCache {
  constructor(
    private readonly cache: CacheStore,
    private readonly users: UserAccountRepository,
    private readonly sessions: RefreshSessionRepository,
  ) {}

  userState(userId: string): Promise<UserAuthState | null> {
    return this.cache.getOrLoad(USER + userId, USER_TTL, () =>
      this.users.findState(userId),
    );
  }

  invalidateUser(userId: string): Promise<void> {
    return this.cache.del(USER + userId);
  }

  isFamilyActive(familyId: string): Promise<boolean> {
    return this.cache.getOrLoad(FAMILY + familyId, FAMILY_TTL, () =>
      this.sessions.isFamilyActive(familyId),
    );
  }

  async markFamiliesRevoked(familyIds: string[]): Promise<void> {
    await Promise.all(
      familyIds.map((id) =>
        this.cache.set(FAMILY + id, false, REVOKED_FAMILY_TTL),
      ),
    );
  }
}
