import { Injectable } from '@nestjs/common';
import { notFound } from '../../common/errors/errors';
import { AuthStateCache } from '../auth-state.cache';
import { UserAccountRepository } from '../user-account.repository';
import type { DeviceSessionDto } from '../dto/device-session.dto';
import { RefreshSessionRepository } from './refresh-session.repository';

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessions: RefreshSessionRepository,
    private readonly users: UserAccountRepository,
    private readonly state: AuthStateCache,
  ) {}

  async list(
    userId: string,
    currentFamilyId: string,
  ): Promise<DeviceSessionDto[]> {
    const rows = await this.sessions.listActive(userId);
    return rows.map((row) => ({
      id: row.familyId,
      deviceName: row.deviceName,
      platform: row.platform,
      ip: row.ip,
      createdAt: row.familyCreatedAt.toISOString(),
      lastUsedAt: row.lastUsedAt.toISOString(),
      current: row.familyId === currentFamilyId,
    }));
  }

  async revokeOwn(userId: string, familyId: string): Promise<void> {
    const owner = await this.sessions.familyOwner(familyId);
    if (owner?.userId !== userId) throw notFound('Session');
    await this.revokeFamily(familyId);
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.sessions.revokeFamily(familyId);
    await this.state.markFamiliesRevoked([familyId]);
  }

  /** Revokes every session (except one, if given); optionally bumps tokenVersion. */
  async revokeAllForUser(
    userId: string,
    options: { exceptFamilyId?: string; bumpTokenVersion?: boolean } = {},
  ): Promise<void> {
    const families = await this.sessions.activeFamilies(
      userId,
      options.exceptFamilyId,
    );
    if (families.length > 0) {
      await this.sessions.revokeFamilies(families);
      await this.state.markFamiliesRevoked(families);
    }
    if (options.bumpTokenVersion) await this.users.bumpTokenVersion(userId);
    await this.state.invalidateUser(userId);
  }
}
