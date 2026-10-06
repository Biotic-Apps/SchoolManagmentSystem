import { createServer, type AddressInfo, type Server } from 'node:net';
import { ClamAvScanner } from './clamav-scanner';
import { CHUNK_SIZE, instreamFrames, parseClamdReply } from './clamd-protocol';

describe('parseClamdReply', () => {
  it.each([
    ['stream: OK\0', { status: 'CLEAN' }],
    ['stream: OK\n', { status: 'CLEAN' }],
    [
      'stream: Eicar-Signature FOUND\0',
      { status: 'INFECTED', signature: 'Eicar-Signature' },
    ],
    [
      'INSTREAM size limit exceeded. ERROR\0',
      { status: 'FAILED', error: 'INSTREAM size limit exceeded. ERROR' },
    ],
    ['', { status: 'FAILED', error: 'empty reply' }],
  ])('%j', (raw, expected) => {
    expect(parseClamdReply(raw)).toEqual(expected);
  });
});

describe('instreamFrames', () => {
  it('frames chunks with 4-byte big-endian sizes and a zero terminator', () => {
    const data = Buffer.alloc(CHUNK_SIZE + 10, 0x61);
    const frames = [...instreamFrames(data)];
    expect(frames[0].toString('latin1')).toBe('zINSTREAM\0');
    expect(frames[1].readUInt32BE(0)).toBe(CHUNK_SIZE);
    expect(frames[1].length).toBe(CHUNK_SIZE + 4);
    expect(frames[2].readUInt32BE(0)).toBe(10);
    expect(frames[3]).toEqual(Buffer.alloc(4));
    expect(frames).toHaveLength(4);
  });
});

/** Minimal clamd: decodes INSTREAM and answers per payload. */
function fakeClamd(verdict: (payload: Buffer) => string | null): Server {
  return createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on('data', (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);
      const command = 'zINSTREAM\0';
      if (buffer.length < command.length) return;
      expect(buffer.subarray(0, command.length).toString()).toBe(command);
      let offset = command.length;
      const parts: Buffer[] = [];
      while (offset + 4 <= buffer.length) {
        const size = buffer.readUInt32BE(offset);
        if (size === 0) {
          const reply = verdict(Buffer.concat(parts));
          if (reply !== null) socket.end(reply);
          return;
        }
        if (offset + 4 + size > buffer.length) return;
        parts.push(buffer.subarray(offset + 4, offset + 4 + size));
        offset += 4 + size;
      }
    });
  });
}

async function listen(server: Server): Promise<number> {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return (server.address() as AddressInfo).port;
}

describe('ClamAvScanner (fake clamd over TCP)', () => {
  let server: Server;
  let port: number;

  beforeAll(async () => {
    server = fakeClamd((payload) => {
      const text = payload.toString('latin1');
      if (text.includes('HANG')) return null;
      return text.includes('EICAR')
        ? 'stream: Eicar-Test-Signature FOUND\0'
        : 'stream: OK\0';
    });
    port = await listen(server);
  });

  afterAll(() => new Promise((resolve) => server.close(resolve)));

  it('reports clean data (multi-chunk upload)', async () => {
    const scanner = new ClamAvScanner({ host: '127.0.0.1', port });
    const data = Buffer.alloc(CHUNK_SIZE * 2 + 5, 0x41);
    await expect(scanner.scan(data)).resolves.toEqual({ status: 'CLEAN' });
  });

  it('reports infected data with the signature', async () => {
    const scanner = new ClamAvScanner({ host: '127.0.0.1', port });
    await expect(scanner.scan(Buffer.from('xx EICAR xx'))).resolves.toEqual({
      status: 'INFECTED',
      signature: 'Eicar-Test-Signature',
    });
  });

  it('fails on timeout', async () => {
    const scanner = new ClamAvScanner({
      host: '127.0.0.1',
      port,
      timeoutMs: 200,
    });
    await expect(scanner.scan(Buffer.from('HANG'))).resolves.toEqual({
      status: 'FAILED',
      error: 'clamd timeout',
    });
  });

  it('fails when clamd is unreachable', async () => {
    const closed = createServer();
    const freePort = await listen(closed);
    await new Promise((resolve) => closed.close(resolve));
    const scanner = new ClamAvScanner({ host: '127.0.0.1', port: freePort });
    const result = await scanner.scan(Buffer.from('x'));
    expect(result.status).toBe('FAILED');
  });
});
