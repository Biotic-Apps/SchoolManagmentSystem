/** Reads exact byte counts and length-prefixed frames from a byte stream. */
export class FrameReader {
  private readonly iterator: AsyncIterator<Buffer>;
  private buffered: Buffer = Buffer.alloc(0);

  constructor(source: AsyncIterable<Buffer | string>) {
    const bytes = (async function* () {
      for await (const chunk of source) {
        yield typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
      }
    })();
    this.iterator = bytes[Symbol.asyncIterator]();
  }

  async readExact(length: number): Promise<Buffer> {
    while (this.buffered.length < length) {
      const next = await this.iterator.next();
      if (next.done) throw new Error('Backup archive is truncated');
      this.buffered = this.buffered.length
        ? Buffer.concat([this.buffered, next.value])
        : next.value;
    }
    const out = this.buffered.subarray(0, length);
    this.buffered = this.buffered.subarray(length);
    return out;
  }

  /** A u32-length-prefixed frame; an empty buffer marks the end of a table. */
  async readFrame(): Promise<Buffer> {
    const length = (await this.readExact(4)).readUInt32BE(0);
    return length === 0 ? Buffer.alloc(0) : this.readExact(length);
  }

  /** True when nothing but the end of the stream remains. */
  async atEnd(): Promise<boolean> {
    if (this.buffered.length > 0) return false;
    const next = await this.iterator.next();
    if (next.done) return true;
    this.buffered = next.value;
    return false;
  }
}
