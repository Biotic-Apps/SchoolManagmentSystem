import {
  base32Decode,
  base32Encode,
  generateTotpSecret,
  matchTotpStep,
  otpauthUrl,
  totpCode,
  totpStep,
} from './totp';

// RFC 6238 Appendix B (SHA1 seed "12345678901234567890"), last 6 digits.
const RFC_SECRET = base32Encode(Buffer.from('12345678901234567890'));
const VECTORS: [number, string][] = [
  [59, '287082'],
  [1111111109, '081804'],
  [1111111111, '050471'],
  [1234567890, '005924'],
  [2000000000, '279037'],
];

describe('totp', () => {
  it('round-trips base32', () => {
    const bytes = Buffer.from('any bytes \u0000ÿ', 'utf8');
    expect(base32Decode(base32Encode(bytes))).toEqual(bytes);
    expect(RFC_SECRET).toBe('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
  });

  it.each(VECTORS)('matches RFC 6238 at T=%i', (seconds, code) => {
    expect(totpCode(RFC_SECRET, totpStep(seconds * 1000))).toBe(code);
  });

  it('generates 160-bit base32 secrets', () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]{32}$/);
    expect(base32Decode(secret)).toHaveLength(20);
    expect(generateTotpSecret()).not.toBe(secret);
  });

  describe('matchTotpStep', () => {
    const secret = generateTotpSecret();
    const now = 1_760_000_000_000;
    const step = totpStep(now);

    it.each([-1, 0, 1])('accepts a code %i step(s) away', (delta) => {
      expect(matchTotpStep(secret, totpCode(secret, step + delta), now)).toBe(
        step + delta,
      );
    });

    it.each([-2, 2])('rejects a code %i steps away', (delta) => {
      expect(
        matchTotpStep(secret, totpCode(secret, step + delta), now),
      ).toBeNull();
    });

    it('ignores spaces and rejects malformed input', () => {
      const code = totpCode(secret, step);
      expect(
        matchTotpStep(secret, `${code.slice(0, 3)} ${code.slice(3)}`, now),
      ).toBe(step);
      expect(matchTotpStep(secret, '12345', now)).toBeNull();
      expect(matchTotpStep(secret, 'abcdef', now)).toBeNull();
    });
  });

  it('builds an otpauth URL authenticator apps understand', () => {
    const url = otpauthUrl('eSchool', 'a@b.c', 'ABC234');
    expect(url).toBe(
      'otpauth://totp/eSchool%3Aa%40b.c?secret=ABC234&issuer=eSchool&algorithm=SHA1&digits=6&period=30',
    );
  });
});
