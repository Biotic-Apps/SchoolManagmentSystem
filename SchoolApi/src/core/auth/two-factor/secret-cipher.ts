import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from 'node:crypto';

const VERSION = 'v1';
const IV_BYTES = 12;
const TAG_BYTES = 16;

/** 32-byte key: the configured base64 key, else HKDF-SHA256 of the fallback secret. */
export function deriveSecretKey(
  configuredBase64: string | undefined,
  fallbackSecret: string,
): Buffer {
  if (configuredBase64) return Buffer.from(configuredBase64, 'base64');
  return Buffer.from(
    hkdfSync('sha256', fallbackSecret, Buffer.alloc(0), 'eschool-totp', 32),
  );
}

/** AES-256-GCM, stored as `v1.<iv>.<tag>.<ciphertext>` (base64url parts). */
export function encryptSecret(plain: string, key: Buffer): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [VERSION, iv, cipher.getAuthTag(), data]
    .map((part) =>
      typeof part === 'string' ? part : part.toString('base64url'),
    )
    .join('.');
}

/** Throws when the value was tampered with or the key is wrong. */
export function decryptSecret(stored: string, key: Buffer): string {
  const [version, iv, tag, data] = stored.split('.');
  if (version !== VERSION || !iv || !tag || data === undefined) {
    throw new Error('Unsupported secret format');
  }
  const tagBytes = Buffer.from(tag, 'base64url');
  if (tagBytes.length !== TAG_BYTES) throw new Error('Invalid secret tag');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'base64url'),
  );
  decipher.setAuthTag(tagBytes);
  return Buffer.concat([
    decipher.update(Buffer.from(data, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}
