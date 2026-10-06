import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { TokenService } from '../token.service';
import {
  generateRecoveryCodes,
  looksLikeTotp,
  normalizeRecoveryCode,
} from './recovery-codes';
import { decryptSecret, deriveSecretKey, encryptSecret } from './secret-cipher';
import { matchTotpStep } from './totp';
import { TwoFactorRepository } from './two-factor.repository';

export type SecondFactor = 'totp' | 'recovery';

/** Secret encryption and single-use checking of TOTP / recovery codes. */
@Injectable()
export class TwoFactorCodes {
  private readonly key: Buffer;

  constructor(
    config: AppConfigService,
    private readonly tokens: TokenService,
    private readonly repository: TwoFactorRepository,
  ) {
    this.key = deriveSecretKey(
      config.get('TWO_FACTOR_ENCRYPTION_KEY'),
      config.get('JWT_REFRESH_SECRET'),
    );
  }

  encrypt(secret: string): string {
    return encryptSecret(secret, this.key);
  }

  decrypt(secretEnc: string): string {
    return decryptSecret(secretEnc, this.key);
  }

  /** New plain codes (shown once) and their hashes (stored). */
  newRecoveryCodes(userId: string): { codes: string[]; hashes: string[] } {
    const codes = generateRecoveryCodes();
    return {
      codes,
      hashes: codes.map((c) =>
        this.hashRecovery(userId, normalizeRecoveryCode(c)!),
      ),
    };
  }

  /**
   * Verifies a code of an enabled user and spends it: a TOTP step is accepted
   * once (replay protection), a recovery code is single use.
   */
  async consume(
    userId: string,
    secretEnc: string,
    code: string,
  ): Promise<SecondFactor | null> {
    if (looksLikeTotp(code)) {
      const step = matchTotpStep(this.decrypt(secretEnc), code);
      if (step === null) return null;
      return (await this.repository.claimStep(userId, step)) ? 'totp' : null;
    }
    const normalized = normalizeRecoveryCode(code);
    if (!normalized) return null;
    const claimed = await this.repository.claimRecoveryCode(
      userId,
      this.hashRecovery(userId, normalized),
    );
    return claimed ? 'recovery' : null;
  }

  private hashRecovery(userId: string, normalized: string): string {
    // Keyed HMAC: fast unique lookup, not reversible without the server key.
    return this.tokens.hash(`2fa-recovery:${userId}:${normalized}`);
  }
}
