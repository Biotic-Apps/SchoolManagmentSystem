import { TEST_DATABASE_URL } from './e2e-db';

// Set before AppModule loads; ConfigModule never overrides existing variables.
Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: TEST_DATABASE_URL,
  JOBS_DRIVER: 'inline',
  CACHE_DRIVER: 'memory',
  THROTTLE_LIMIT: '100000',
  AUTH_THROTTLE_LIMIT: '100000',
  STORAGE_LOCAL_DIR: 'storage/test',
  // Test-only key (32 zero-padded bytes); never used outside e2e.
  BACKUP_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
});
