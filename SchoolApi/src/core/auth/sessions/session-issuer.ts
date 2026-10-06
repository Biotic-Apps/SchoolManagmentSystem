import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { ClientPlatform, User } from '../../../generated/prisma/client';
import { AppConfigService } from '../../../config/app-config.service';
import { AuthStateCache } from '../auth-state.cache';
import type { AuthTokensDto } from '../dto/auth-tokens.dto';
import { TokenService } from '../token.service';
import {
  RefreshSessionRepository,
  type NewSession,
} from './refresh-session.repository';

export interface ClientInfo {
  platform: ClientPlatform;
  deviceName?: string;
  ip?: string;
  userAgent?: string;
}

type TokenUser = Pick<User, 'id' | 'tokenVersion' | 'mustChangePassword'>;

/** Creates refresh-session rows and the token pair handed to the client. */
@Injectable()
export class SessionIssuer {
  constructor(
    private readonly sessions: RefreshSessionRepository,
    private readonly tokens: TokenService,
    private readonly state: AuthStateCache,
    private readonly config: AppConfigService,
  ) {}

  /** New session family (password login or completed 2FA challenge). */
  async start(user: TokenUser, client: ClientInfo): Promise<AuthTokensDto> {
    const familyId = randomUUID();
    const token = this.tokens.newOpaqueToken();
    await this.sessions.create(
      this.newSession(user.id, familyId, token, client),
    );
    await this.state.invalidateUser(user.id);
    return this.tokensFor(user, familyId, token);
  }

  newSession(
    userId: string,
    familyId: string,
    token: string,
    client: ClientInfo,
  ): NewSession {
    const days = this.config.get('REFRESH_TTL_DAYS');
    return {
      userId,
      familyId,
      tokenHash: this.tokens.hash(token),
      deviceName: client.deviceName?.slice(0, 100) ?? null,
      platform: client.platform,
      ip: client.ip ?? null,
      userAgent: client.userAgent ?? null,
      expiresAt: new Date(Date.now() + days * 86_400_000),
    };
  }

  async tokensFor(
    user: TokenUser,
    familyId: string,
    refreshToken: string,
  ): Promise<AuthTokensDto> {
    const accessToken = await this.tokens.signAccess({
      sub: user.id,
      sid: familyId,
      ver: user.tokenVersion,
    });
    return {
      accessToken,
      refreshToken,
      accessExpiresIn: this.tokens.accessTtlSeconds,
      mustChangePassword: user.mustChangePassword,
    };
  }
}
