import { createHmac } from 'node:crypto';
import type { AppConfigService } from '../../../config/app-config.service';
import type { TokenService } from '../token.service';
import { normalizeRecoveryCode } from './recovery-codes';
import { generateTotpSecret, totpCode, totpStep } from './totp';
import { TwoFactorCodes } from './two-factor-codes';
import type { TwoFactorRepository } from './two-factor.repository';

/** In-memory stand-in with the same conditional-update semantics. */
function fakeRepository() {
  let lastUsedStep: number | null = null;
  const recovery = new Map<string, Date | null>();
  return {
    recovery,
    claimStep: jest.fn((_: string, step: number) => {
      if (lastUsedStep !== null && lastUsedStep >= step) {
        return Promise.resolve(false);
      }
      lastUsedStep = step;
      return Promise.resolve(true);
    }),
    claimRecoveryCode: jest.fn((_: string, hash: string) => {
      if (!recovery.has(hash) || recovery.get(hash)) {
        return Promise.resolve(false);
      }
      recovery.set(hash, new Date());
      return Promise.resolve(true);
    }),
  };
}

function setup() {
  const repository = fakeRepository();
  const config = {
    get: (key: string) =>
      key === 'JWT_REFRESH_SECRET' ? 'refresh-secret' : undefined,
  };
  const tokens = {
    hash: (value: string) =>
      createHmac('sha256', 'k').update(value).digest('hex'),
  };
  const codes = new TwoFactorCodes(
    config as unknown as AppConfigService,
    tokens as unknown as TokenService,
    repository as unknown as TwoFactorRepository,
  );
  return { codes, repository };
}

describe('TwoFactorCodes', () => {
  it('accepts a TOTP once (replay of the same step is refused)', async () => {
    const { codes } = setup();
    const secret = generateTotpSecret();
    const enc = codes.encrypt(secret);
    const code = totpCode(secret, totpStep());

    expect(await codes.consume('u1', enc, code)).toBe('totp');
    expect(await codes.consume('u1', enc, code)).toBeNull();
  });

  it('refuses an older step once a newer one was used', async () => {
    const { codes } = setup();
    const secret = generateTotpSecret();
    const enc = codes.encrypt(secret);
    const step = totpStep();

    expect(await codes.consume('u1', enc, totpCode(secret, step + 1))).toBe(
      'totp',
    );
    expect(await codes.consume('u1', enc, totpCode(secret, step))).toBeNull();
  });

  it('accepts each recovery code exactly once, in any format', async () => {
    const { codes, repository } = setup();
    const { codes: plain, hashes } = codes.newRecoveryCodes('u1');
    expect(plain).toHaveLength(10);
    expect(new Set(plain).size).toBe(10);
    plain.forEach((c) => expect(c).toMatch(/^[a-z2-7]{5}-[a-z2-7]{5}$/));
    hashes.forEach((h) => repository.recovery.set(h, null));
    expect(hashes.join()).not.toContain(normalizeRecoveryCode(plain[0])!);

    const enc = codes.encrypt(generateTotpSecret());
    expect(await codes.consume('u1', enc, ` ${plain[0].toUpperCase()} `)).toBe(
      'recovery',
    );
    expect(await codes.consume('u1', enc, plain[0])).toBeNull();
    expect(await codes.consume('u1', enc, plain[1])).toBe('recovery');
  });

  it('binds recovery codes to their user', async () => {
    const { codes, repository } = setup();
    const { codes: plain, hashes } = codes.newRecoveryCodes('u1');
    hashes.forEach((h) => repository.recovery.set(h, null));
    const enc = codes.encrypt(generateTotpSecret());

    expect(await codes.consume('u2', enc, plain[0])).toBeNull();
  });

  it('rejects wrong and malformed codes', async () => {
    const { codes } = setup();
    const enc = codes.encrypt(generateTotpSecret());
    expect(await codes.consume('u1', enc, '000000')).toBeNull();
    expect(await codes.consume('u1', enc, 'not a code!')).toBeNull();
  });
});
