import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function readVersion(): string {
  try {
    const manifest = readFileSync(join(__dirname, '..', '..', 'package.json'));
    const parsed = JSON.parse(manifest.toString()) as { version?: string };
    return parsed.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export const APP_VERSION = readVersion();
