import type { SourceStats } from '../dump/source-stats';
import type { FrameReader } from './frame-reader';

/**
 * Built-in "copy" dump (gzipped before encryption):
 *   'ESCP' + version byte + u32 header length + header JSON,
 *   then per header table: name frame, COPY text data frames, empty frame.
 * Frames are u32 big-endian length + bytes.
 */
const MAGIC = Buffer.from('ESCP', 'ascii');
export const ARCHIVE_VERSION = 1;

export interface ArchiveTable {
  name: string;
  columns: string[];
  rows: number;
}

export interface ArchiveHeader {
  formatVersion: number;
  createdAt: string;
  migrations: string[];
  tables: ArchiveTable[];
  sourceStats: SourceStats;
}

export function frame(data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  return Buffer.concat([length, data]);
}

export const END_FRAME = Buffer.alloc(4);

export function encodeHeader(header: ArchiveHeader): Buffer {
  return Buffer.concat([
    MAGIC,
    Buffer.from([ARCHIVE_VERSION]),
    frame(Buffer.from(JSON.stringify(header), 'utf8')),
  ]);
}

export async function readHeader(reader: FrameReader): Promise<ArchiveHeader> {
  const magic = await reader.readExact(MAGIC.length + 1);
  if (!magic.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error('Not a copy-format backup archive');
  }
  if (magic[MAGIC.length] !== ARCHIVE_VERSION) {
    throw new Error(`Unsupported archive version ${magic[MAGIC.length]}`);
  }
  const header = JSON.parse(
    (await reader.readFrame()).toString('utf8'),
  ) as ArchiveHeader;
  if (!Array.isArray(header.tables) || !Array.isArray(header.migrations)) {
    throw new Error('Backup archive header is malformed');
  }
  return header;
}

/** Frames of one table, starting with its name and ending with END_FRAME. */
export async function* tableFrames(
  name: string,
  data: AsyncIterable<Buffer | string>,
): AsyncGenerator<Buffer> {
  yield frame(Buffer.from(name, 'utf8'));
  for await (const chunk of data) {
    const bytes = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
    if (bytes.length > 0) yield frame(bytes);
  }
  yield END_FRAME;
}

/** Data chunks of the next table; checks that it is `expected`. */
export async function* readTable(
  reader: FrameReader,
  expected: string,
): AsyncGenerator<Buffer> {
  const name = (await reader.readFrame()).toString('utf8');
  if (name !== expected) {
    throw new Error(`Archive out of order: expected ${expected}, got ${name}`);
  }
  for (;;) {
    const chunk = await reader.readFrame();
    if (chunk.length === 0) return;
    yield chunk;
  }
}
