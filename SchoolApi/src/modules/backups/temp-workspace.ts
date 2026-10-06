import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Runs `work` in a private os.tmpdir()/eschool-backup-* folder, always removed. */
export async function withTempWorkspace<T>(
  work: (path: (name: string) => string) => Promise<T>,
): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), 'eschool-backup-'));
  try {
    return await work((name) => join(dir, name));
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}
