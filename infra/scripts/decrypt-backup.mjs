#!/usr/bin/env node
// Decrypts an eSchool backup (*.esbk) to a plain dump, outside the app (restore drill / disaster recovery).
//   read -rs BACKUP_ENCRYPTION_KEY && export BACKUP_ENCRYPTION_KEY
//   node decrypt-backup.mjs <backup.esbk> <output.dump>
// File layout (SchoolApi/src/modules/backups/crypto/backup-cipher.ts):
//   'ESBK' + version byte (1) + 12-byte IV + AES-256-GCM ciphertext + 16-byte auth tag.
// The output is a `pg_dump -Fc` archive (format "pg_dump") or the built-in COPY archive (format "copy", dev only).
// No dependencies: Node 18+.
import { createDecipheriv } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { open, rm, stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';

const MAGIC = Buffer.from('ESBK', 'ascii');
const VERSION = 1;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const HEADER_LENGTH = MAGIC.length + 1 + IV_LENGTH;

function fail(message) {
  console.error(message);
  process.exit(1);
}

const [source, target] = process.argv.slice(2);
if (!source || !target) fail('Usage: node decrypt-backup.mjs <backup.esbk> <output.dump>');

const key = Buffer.from(process.env.BACKUP_ENCRYPTION_KEY ?? '', 'base64');
if (key.length !== 32) fail('BACKUP_ENCRYPTION_KEY must be set to the 32-byte base64 key from the production .env');

const { size } = await stat(source);
if (size < HEADER_LENGTH + TAG_LENGTH) fail('File is truncated or not an eSchool backup');

const header = Buffer.alloc(HEADER_LENGTH);
const tag = Buffer.alloc(TAG_LENGTH);
const handle = await open(source, 'r');
try {
  await handle.read(header, 0, HEADER_LENGTH, 0);
  await handle.read(tag, 0, TAG_LENGTH, size - TAG_LENGTH);
} finally {
  await handle.close();
}
if (!header.subarray(0, MAGIC.length).equals(MAGIC)) fail('Not an eSchool backup file');
if (header[MAGIC.length] !== VERSION) fail(`Unsupported backup file version ${header[MAGIC.length]}`);

const decipher = createDecipheriv('aes-256-gcm', key, header.subarray(MAGIC.length + 1));
decipher.setAuthTag(tag);
const end = size - TAG_LENGTH - 1;
const input = end >= HEADER_LENGTH ? createReadStream(source, { start: HEADER_LENGTH, end }) : (async function* () {})();

try {
  await pipeline(input, decipher, createWriteStream(target, { flags: 'wx', mode: 0o600 }));
} catch (error) {
  if (error?.code === 'EEXIST') fail(`${target} already exists`);
  await rm(target, { force: true });
  if (/authenticate/i.test(String(error?.message))) fail('Integrity check failed: wrong key or damaged file');
  throw error;
}
console.log(`Decrypted ${source} -> ${target}`);
