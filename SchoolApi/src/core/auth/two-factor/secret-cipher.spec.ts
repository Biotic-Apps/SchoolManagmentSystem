import { randomBytes } from 'node:crypto';
import { decryptSecret, deriveSecretKey, encryptSecret } from './secret-cipher';

describe('secret-cipher', () => {
  const key = randomBytes(32);

  it('round-trips with a random IV each time', () => {
    const a = encryptSecret('JBSWY3DPEHPK3PXP', key);
    const b = encryptSecret('JBSWY3DPEHPK3PXP', key);
    expect(a).not.toBe(b);
    expect(a).not.toContain('JBSWY3DPEHPK3PXP');
    expect(decryptSecret(a, key)).toBe('JBSWY3DPEHPK3PXP');
  });

  it('detects tampering with the ciphertext, IV or tag', () => {
    const stored = encryptSecret('JBSWY3DPEHPK3PXP', key);
    const parts = stored.split('.');
    for (const index of [1, 2, 3]) {
      const bytes = Buffer.from(parts[index], 'base64url');
      bytes[0] ^= 1;
      const tampered = [...parts];
      tampered[index] = bytes.toString('base64url');
      expect(() => decryptSecret(tampered.join('.'), key)).toThrow();
    }
  });

  it('fails with the wrong key or format', () => {
    const stored = encryptSecret('secret', key);
    expect(() => decryptSecret(stored, randomBytes(32))).toThrow();
    expect(() => decryptSecret('plain-text', key)).toThrow();
  });

  it('uses the configured key, else HKDF of the fallback secret', () => {
    const configured = randomBytes(32);
    expect(deriveSecretKey(configured.toString('base64'), 'x')).toEqual(
      configured,
    );
    const derived = deriveSecretKey(undefined, 'refresh-secret');
    expect(derived).toHaveLength(32);
    expect(deriveSecretKey(undefined, 'refresh-secret')).toEqual(derived);
    expect(deriveSecretKey(undefined, 'other')).not.toEqual(derived);
  });
});
