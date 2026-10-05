import { dirname, join, resolve } from 'node:path';

export const LOCAL_DB = {
  dataDir: resolve(__dirname, '..', '.pgdata'),
  port: 5433,
  user: 'eschool',
  password: 'eschool',
  databases: ['eschool', 'eschool_test'],
};

export function nativeBinDir(): string {
  const os = process.platform === 'win32' ? 'windows' : process.platform;
  // The platform package only exports dist/index.js; binaries sit next to dist/.
  const entry = require.resolve(`@embedded-postgres/${os}-${process.arch}`);
  return join(dirname(entry), '..', 'native', 'bin');
}
