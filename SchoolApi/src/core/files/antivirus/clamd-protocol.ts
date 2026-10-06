import type { ScanResult } from './antivirus-scanner';

export const INSTREAM_COMMAND = Buffer.from('zINSTREAM\0', 'latin1');
/** clamd's default StreamMaxLength is 25 MB; chunks stay well below. */
export const CHUNK_SIZE = 64 * 1024;

/** INSTREAM framing: command, `<uint32 BE length><bytes>`…, zero terminator. */
export function* instreamFrames(data: Buffer): Generator<Buffer> {
  yield INSTREAM_COMMAND;
  for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
    const chunk = data.subarray(offset, offset + CHUNK_SIZE);
    const size = Buffer.alloc(4);
    size.writeUInt32BE(chunk.length, 0);
    yield Buffer.concat([size, chunk]);
  }
  yield Buffer.alloc(4);
}

/**
 * Parses the clamd reply (`stream: OK`, `stream: Eicar-Signature FOUND`,
 * `INSTREAM size limit exceeded. ERROR`), NUL- or newline-terminated.
 */
export function parseClamdReply(raw: string): ScanResult {
  const reply = raw.replace(/[\0\n\r]+$/g, '').trim();
  if (/^(stream: )?OK$/.test(reply)) return { status: 'CLEAN' };
  const found = /^(?:stream: )?(.+) FOUND$/.exec(reply);
  if (found) return { status: 'INFECTED', signature: found[1].trim() };
  return { status: 'FAILED', error: reply.slice(0, 200) || 'empty reply' };
}
