import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGunzip, createGzip } from 'node:zlib';
import {
  encodeHeader,
  readHeader,
  readTable,
  tableFrames,
  type ArchiveHeader,
} from './copy-archive';
import { FrameReader } from './frame-reader';

const header: ArchiveHeader = {
  formatVersion: 1,
  createdAt: '2026-10-06T00:00:00.000Z',
  migrations: ['m1', 'm2'],
  tables: [
    { name: 'a', columns: ['id', 'name'], rows: 2 },
    { name: 'empty', columns: ['id'], rows: 0 },
    { name: 'big', columns: ['x'], rows: 3000 },
  ],
  sourceStats: {
    counts: { users: 1 },
    ledgerTotal: '0',
    ledgerPerStudentMd5: 'd41d8cd98f00b204e9800998ecf8427e',
    latestAuditId: null,
    migrations: ['m1', 'm2'],
  },
};

const big = Array.from({ length: 3000 }, (_, i) => `${i}\n`);
const data: Record<string, string[]> = {
  a: ['1\tAli\n2\t', 'Sara\n'],
  empty: [],
  big,
};

async function* archive(): AsyncGenerator<Buffer> {
  yield encodeHeader(header);
  for (const table of header.tables) {
    yield* tableFrames(table.name, Readable.from(data[table.name]));
  }
}

async function bytes(chunks: AsyncIterable<Buffer>): Promise<Buffer> {
  const parts: Buffer[] = [];
  for await (const chunk of chunks) parts.push(chunk);
  return Buffer.concat(parts);
}

const collect = async (chunks: AsyncIterable<Buffer>) =>
  (await bytes(chunks)).toString();

describe('copy archive framing', () => {
  it('round-trips the header and table data through gzip', async () => {
    const zipped: Buffer[] = [];
    await pipeline(Readable.from(archive()), createGzip(), async (source) => {
      for await (const chunk of source) zipped.push(chunk as Buffer);
    });
    const gunzip = createGunzip();
    gunzip.end(Buffer.concat(zipped));
    const reader = new FrameReader(gunzip);
    expect(await readHeader(reader)).toEqual(header);
    for (const table of header.tables) {
      expect(await collect(readTable(reader, table.name))).toBe(
        data[table.name].join(''),
      );
    }
    expect(await reader.atEnd()).toBe(true);
  });

  it('rejects tables out of order', async () => {
    const reader = new FrameReader(Readable.from(archive()));
    await readHeader(reader);
    await expect(collect(readTable(reader, 'empty'))).rejects.toThrow(
      /out of order/,
    );
  });

  it('rejects a truncated archive', async () => {
    const whole = await bytes(archive());
    const reader = new FrameReader(Readable.from([whole.subarray(0, 40)]));
    await expect(readHeader(reader)).rejects.toThrow(/truncated/);
  });

  it('rejects foreign data', async () => {
    const reader = new FrameReader(Readable.from([Buffer.from('PGDMPxxxx')]));
    await expect(readHeader(reader)).rejects.toThrow(/Not a copy-format/);
  });
});
