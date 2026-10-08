import { createReadStream, createWriteStream } from 'node:fs';
import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import type { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { StorageDriver } from './storage-driver';

export class LocalStorageDriver extends StorageDriver {
  readonly name = 'local' as const;
  private readonly root: string;

  constructor(root: string) {
    super();
    this.root = resolve(root);
  }

  async put(key: string, data: Buffer): Promise<void> {
    const target = this.pathOf(key);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, data, { flag: 'wx' });
  }

  async putFile(key: string, path: string): Promise<void> {
    const target = this.pathOf(key);
    await mkdir(dirname(target), { recursive: true });
    await pipeline(
      createReadStream(path),
      createWriteStream(target, { flags: 'wx' }),
    );
  }

  read(key: string): Promise<Readable> {
    return Promise.resolve(createReadStream(this.pathOf(key)));
  }

  async delete(key: string): Promise<void> {
    await rm(this.pathOf(key), { force: true });
  }

  async check(): Promise<boolean> {
    try {
      await mkdir(this.root, { recursive: true });
      await access(this.root);
      return true;
    } catch {
      return false;
    }
  }

  presignedUrl(): Promise<string | null> {
    return Promise.resolve(null);
  }

  private pathOf(key: string): string {
    const target = resolve(this.root, key);
    if (!target.startsWith(this.root + sep))
      throw new Error('Invalid storage key');
    return target;
  }
}
