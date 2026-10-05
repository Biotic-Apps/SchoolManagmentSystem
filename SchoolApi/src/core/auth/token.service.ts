import { createHmac, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../config/app-config.service';
import { durationToSeconds } from '../../config/duration';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code.enum';
import type { AccessClaims } from './jwt-claims';

@Injectable()
export class TokenService {
  readonly accessTtlSeconds: number;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {
    this.accessTtlSeconds = durationToSeconds(config.get('JWT_ACCESS_TTL'));
  }

  signAccess(claims: AccessClaims): Promise<string> {
    return this.jwt.signAsync(
      { sub: claims.sub, sid: claims.sid, ver: claims.ver },
      { expiresIn: this.accessTtlSeconds },
    );
  }

  async verifyAccess(token: string): Promise<AccessClaims> {
    try {
      const claims = await this.jwt.verifyAsync<AccessClaims>(token);
      if (typeof claims.sub !== 'string' || typeof claims.ver !== 'number') {
        throw new Error('malformed claims');
      }
      return claims;
    } catch {
      throw new AppError(ErrorCode.UNAUTHENTICATED, 'Invalid or expired token');
    }
  }

  /** 256-bit opaque token (refresh, password reset). */
  newOpaqueToken(): string {
    return randomBytes(32).toString('base64url');
  }

  /** Stored form of an opaque token: HMAC-SHA256 keyed by JWT_REFRESH_SECRET. */
  hash(token: string): string {
    return createHmac('sha256', this.config.get('JWT_REFRESH_SECRET'))
      .update(token)
      .digest('hex');
  }
}
