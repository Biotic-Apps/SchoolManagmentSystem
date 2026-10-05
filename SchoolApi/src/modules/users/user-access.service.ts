import { Injectable } from '@nestjs/common';
import { SessionsService } from '../../core/auth/sessions/sessions.service';
import { AccessCache } from '../../core/rbac/access/access-cache';

/** Applies access changes immediately (security.md §1 instant revoke). */
@Injectable()
export class UserAccessService {
  constructor(
    private readonly sessions: SessionsService,
    private readonly access: AccessCache,
  ) {}

  /** Role removed, disabled or password reset: drop every session now. */
  async revokeEverything(userId: string): Promise<void> {
    await this.access.invalidateUser(userId);
    await this.sessions.revokeAllForUser(userId, { bumpTokenVersion: true });
  }

  /** Role added: new permissions apply on the next request. */
  refreshAssignments(userId: string): Promise<void> {
    return this.access.invalidateUser(userId);
  }
}
