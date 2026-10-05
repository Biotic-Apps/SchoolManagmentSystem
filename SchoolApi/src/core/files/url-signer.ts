import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { API_PREFIX } from '../../bootstrap/configure-app';

export const SIGNED_URL_TTL_SECONDS = 5 * 60;

export interface SignedUrl {
  url: string;
  expiresAt: string;
}

/** HMAC-signed, expiring links to GET /files/:id/content. */
@Injectable()
export class UrlSigner {
  constructor(private readonly config: AppConfigService) {}

  sign(fileId: string, now = Date.now()): SignedUrl {
    const exp = Math.floor(now / 1000) + SIGNED_URL_TTL_SECONDS;
    const base = this.config.get('APP_URL').replace(/\/$/, '');
    const sig = this.signature(fileId, exp);
    return {
      url: `${base}/${API_PREFIX}/files/${fileId}/content?exp=${exp}&sig=${sig}`,
      expiresAt: new Date(exp * 1000).toISOString(),
    };
  }

  verify(fileId: string, exp: number, sig: string): boolean {
    if (!Number.isInteger(exp) || exp * 1000 < Date.now()) return false;
    const expected = Buffer.from(this.signature(fileId, exp));
    const given = Buffer.from(sig);
    return expected.length === given.length && timingSafeEqual(expected, given);
  }

  private signature(fileId: string, exp: number): string {
    return createHmac('sha256', this.config.get('FILE_URL_SECRET'))
      .update(`${fileId}.${exp}`)
      .digest('base64url');
  }
}
