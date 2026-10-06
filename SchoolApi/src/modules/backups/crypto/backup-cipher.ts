import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { open, stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';

/**
 * Encrypted backup file: 'ESBK' + version byte + 12-byte IV + AES-256-GCM
 * ciphertext + 16-byte auth tag.
 */
const MAGIC = Buffer.from('ESBK', 'ascii');
const VERSION = 1;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const HEADER_LENGTH = MAGIC.length + 1 + IV_LENGTH;
const ALGORITHM = 'aes-256-gcm';

export const BACKUP_FILE_MAGIC = 'ESBK';

/** Decodes BACKUP_ENCRYPTION_KEY; a backup never runs without it. */
export function backupKey(base64: string | undefined): Buffer {
  if (!base64) {
    throw new Error(
      'BACKUP_ENCRYPTION_KEY is not set: backups are never written unencrypted',
    );
  }
  const key = Buffer.from(base64, 'base64');
  if (key.length !== 32) {
    throw new Error('BACKUP_ENCRYPTION_KEY must be 32 bytes (base64)');
  }
  return key;
}

export async function encryptFile(
  source: string,
  target: string,
  key: Buffer,
): Promise<void> {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const header = Buffer.concat([MAGIC, Buffer.from([VERSION]), iv]);
  await pipeline(
    createReadStream(source),
    cipher,
    async function* (encrypted: AsyncIterable<Buffer>) {
      yield header;
      for await (const chunk of encrypted) yield chunk;
      yield cipher.getAuthTag();
    },
    createWriteStream(target, { flags: 'wx' }),
  );
}

const corrupt = () =>
  new Error('Backup file failed the integrity check (wrong key or tampered)');

/** Decrypts to `target`; resolves only when the auth tag matched. */
export async function decryptFile(
  source: string,
  target: string,
  key: Buffer,
): Promise<void> {
  const { size } = await stat(source);
  if (size < HEADER_LENGTH + TAG_LENGTH) {
    throw new Error('Backup file is truncated or not a backup');
  }
  const header = Buffer.alloc(HEADER_LENGTH);
  const tag = Buffer.alloc(TAG_LENGTH);
  const handle = await open(source, 'r');
  try {
    await handle.read(header, 0, HEADER_LENGTH, 0);
    await handle.read(tag, 0, TAG_LENGTH, size - TAG_LENGTH);
  } finally {
    await handle.close();
  }
  if (!header.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error('Not an eSchool backup file');
  }
  if (header[MAGIC.length] !== VERSION) {
    throw new Error(`Unsupported backup file version ${header[MAGIC.length]}`);
  }
  const iv = header.subarray(MAGIC.length + 1);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const end = size - TAG_LENGTH - 1;
  const input =
    end >= HEADER_LENGTH
      ? createReadStream(source, { start: HEADER_LENGTH, end })
      : (async function* () {})();
  try {
    await pipeline(input, decipher, createWriteStream(target));
  } catch (error) {
    if (/authenticate/i.test(String((error as Error)?.message))) {
      throw corrupt();
    }
    throw error;
  }
}

/** sha256 (hex) and size of a file. */
export async function fileDigest(
  path: string,
): Promise<{ sha256: string; size: number }> {
  const hash = createHash('sha256');
  let size = 0;
  for await (const chunk of createReadStream(path)) {
    const buffer = chunk as Buffer;
    size += buffer.length;
    hash.update(buffer);
  }
  return { sha256: hash.digest('hex'), size };
}
