import { randomBytes } from 'node:crypto';
import { readFile, stat, truncate, writeFile } from 'node:fs/promises';
import { withTempWorkspace } from '../temp-workspace';
import {
  backupKey,
  decryptFile,
  encryptFile,
  fileDigest,
} from './backup-cipher';

const key = randomBytes(32);

async function roundTrip(
  plain: Buffer,
  mutate?: (file: string) => Promise<void>,
  decryptKey = key,
): Promise<Buffer> {
  return withTempWorkspace(async (path) => {
    await writeFile(path('plain'), plain);
    await encryptFile(path('plain'), path('enc'), key);
    if (mutate) await mutate(path('enc'));
    await decryptFile(path('enc'), path('out'), decryptKey);
    return readFile(path('out'));
  });
}

describe('backup cipher', () => {
  it('round-trips a small file', async () => {
    const plain = Buffer.from('hello backup');
    expect(await roundTrip(plain)).toEqual(plain);
  });

  it('round-trips an empty file', async () => {
    expect(await roundTrip(Buffer.alloc(0))).toEqual(Buffer.alloc(0));
  });

  it('round-trips a large multi-chunk file', async () => {
    const plain = randomBytes(5 * 1024 * 1024 + 123);
    expect((await roundTrip(plain)).equals(plain)).toBe(true);
  });

  it('writes the ESBK header and never the plaintext', async () => {
    await withTempWorkspace(async (path) => {
      const plain = Buffer.from('secret-marker-'.repeat(50));
      await writeFile(path('plain'), plain);
      await encryptFile(path('plain'), path('enc'), key);
      const enc = await readFile(path('enc'));
      expect(enc.subarray(0, 4).toString()).toBe('ESBK');
      expect(enc.length).toBe(plain.length + 4 + 1 + 12 + 16);
      expect(enc.includes(Buffer.from('secret-marker'))).toBe(false);
      const digest = await fileDigest(path('enc'));
      expect(digest.size).toBe(enc.length);
      expect(digest.sha256).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  it('fails with the wrong key', async () => {
    await expect(
      roundTrip(Buffer.from('data'), undefined, randomBytes(32)),
    ).rejects.toThrow(/integrity/);
  });

  it('fails when a byte was tampered with', async () => {
    const tamper = async (file: string) => {
      const enc = await readFile(file);
      enc[20] ^= 0xff;
      await writeFile(file, enc);
    };
    await expect(roundTrip(randomBytes(4096), tamper)).rejects.toThrow(
      /integrity/,
    );
  });

  it('fails when the file was truncated', async () => {
    const cut = async (file: string) => {
      const { size } = await stat(file);
      await truncate(file, size - 5);
    };
    await expect(roundTrip(randomBytes(4096), cut)).rejects.toThrow(
      /integrity/,
    );
    const toHeader = (file: string) => truncate(file, 10);
    await expect(roundTrip(randomBytes(64), toHeader)).rejects.toThrow(
      /truncated/,
    );
  });

  it('requires a 32-byte key', () => {
    expect(() => backupKey(undefined)).toThrow(/BACKUP_ENCRYPTION_KEY/);
    expect(() => backupKey(Buffer.alloc(16).toString('base64'))).toThrow(
      /32 bytes/,
    );
    expect(backupKey(key.toString('base64'))).toEqual(key);
  });
});
