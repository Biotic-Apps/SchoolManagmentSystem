import { spawn } from 'node:child_process';
import { pgToolEnv, type PgTarget } from './pg-target';

const STDERR_LIMIT = 2000;

/** Runs a PostgreSQL client binary; rejects with its stderr on failure. */
export function runPgTool(
  binary: string,
  args: string[],
  target: PgTarget,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, {
      env: pgToolEnv(target),
      stdio: ['ignore', 'ignore', 'pipe'],
      windowsHide: true,
    });
    let stderr = '';
    child.stderr.on('data', (chunk: Buffer) => {
      if (stderr.length < STDERR_LIMIT) stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      const name = binary.split(/[\\/]/).pop();
      reject(
        new Error(
          `${name} exited with code ${code}: ${stderr.trim().slice(0, STDERR_LIMIT)}`,
        ),
      );
    });
  });
}

/** True when `binary --version` runs. */
export function isRunnable(binary: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(binary, ['--version'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    child.on('error', () => resolve(false));
    child.on('close', (code) => resolve(code === 0));
  });
}

export type DumpFormat = 'pg_dump' | 'copy';

export interface ToolSettings {
  pgDumpPath?: string;
  production: boolean;
}

/**
 * pg_dump when available; the built-in COPY dump only outside production
 * (or when no pg_dump is installed and none was configured).
 */
export async function chooseDumpFormat(
  settings: ToolSettings,
  runnable: (binary: string) => Promise<boolean> = isRunnable,
): Promise<{ format: DumpFormat; binary?: string }> {
  if (settings.pgDumpPath) {
    if (await runnable(settings.pgDumpPath)) {
      return { format: 'pg_dump', binary: settings.pgDumpPath };
    }
    throw new Error('PG_DUMP_PATH is set but that pg_dump cannot be run');
  }
  if (await runnable('pg_dump'))
    return { format: 'pg_dump', binary: 'pg_dump' };
  if (settings.production) {
    throw new Error(
      'pg_dump not found: install the PostgreSQL client tools or set PG_DUMP_PATH',
    );
  }
  return { format: 'copy' };
}
