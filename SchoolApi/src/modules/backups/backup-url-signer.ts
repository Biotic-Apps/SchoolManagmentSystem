import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { API_PREFIX } from '../../bootstrap/configure-app';
import { AppConfigService } from '../../config/app-config.service';
import type { SignedUrl } from '../../core/files/url-signer';

export const BACKUP_URL_TTL_SECONDS = 5 * 60;

/**
 * HMAC-signed, 5-minute links to GET /backups/:id/content (local storage).
 * Distinct prefix so a file-link signature never validates here.
 */
@Injectable()
export class BackupUrlSigner {
  constructor(private readonly config: AppConfigService) {}

  sign(backupId: string, now = Date.now()): SignedUrl {
    const exp = Math.floor(now / 1000) + BACKUP_URL_TTL_SECONDS;
    const base = this.config.get('APP_URL').replace(/\/$/, '');
    const sig = this.signature(backupId, exp);
    return {
      url: `${base}/${API_PREFIX}/backups/${backupId}/content?exp=${exp}&sig=${sig}`,
      expiresAt: new Date(exp * 1000).toISOString(),
    };
  }

  verify(backupId: string, exp: number, sig: string): boolean {
    if (!Number.isInteger(exp) || exp * 1000 < Date.now()) return false;
    const expected = Buffer.from(this.signature(backupId, exp));
    const given = Buffer.from(sig);
    return expected.length === given.length && timingSafeEqual(expected, given);
  }

  private signature(backupId: string, exp: number): string {
    return createHmac('sha256', this.config.get('FILE_URL_SECRET'))
      .update(`backup-download:${backupId}.${exp}`)
      .digest('base64url');
  }
}
