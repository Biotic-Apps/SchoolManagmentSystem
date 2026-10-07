import {
  generateOtpCode,
  normalizeOtpCode,
  otpHashInput,
  sameHash,
} from './otp-code';

describe('otp-code', () => {
  it('generates 6-digit codes', () => {
    for (let i = 0; i < 50; i++) expect(generateOtpCode()).toMatch(/^\d{6}$/);
  });

  it('normalises typed codes', () => {
    expect(normalizeOtpCode(' 123 456 ')).toBe('123456');
    expect(normalizeOtpCode('12345')).toBeNull();
    expect(normalizeOtpCode('12345a')).toBeNull();
  });

  it('binds the hash input to the row id', () => {
    expect(otpHashInput('a', '1')).not.toBe(otpHashInput('b', '1'));
  });

  it('compares hashes in constant time', () => {
    expect(sameHash('abc', 'abc')).toBe(true);
    expect(sameHash('abd', 'abc')).toBe(false);
    expect(sameHash(null, 'abc')).toBe(false);
    expect(sameHash('ab', 'abc')).toBe(false);
  });
});
