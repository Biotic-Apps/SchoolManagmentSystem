import { validateEnv } from './validate-env';

const validEnv = {
  NODE_ENV: 'development',
  PORT: '4000',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/eschool',
  REDIS_URL: 'redis://localhost:6379',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
  FILE_URL_SECRET: 'c'.repeat(32),
  CORS_ORIGINS: 'http://localhost:3001, https://web.example.com',
  S3_ENDPOINT: 'http://localhost:9000',
  S3_BUCKET: 'eschool',
  S3_ACCESS_KEY: 'key',
  S3_SECRET_KEY: 'secret',
};

describe('validateEnv', () => {
  it('parses and coerces a valid environment', () => {
    const env = validateEnv(validEnv);

    expect(env.PORT).toBe(4000);
    expect(env.CORS_ORIGINS).toEqual([
      'http://localhost:3001',
      'https://web.example.com',
    ]);
  });

  it('applies defaults for optional values', () => {
    const env = validateEnv(validEnv);

    expect(env.JWT_ACCESS_TTL).toBe('15m');
    expect(env.REFRESH_TTL_DAYS).toBe(30);
    expect(env.S3_REGION).toBe('us-east-1');
    expect(env.S3_FORCE_PATH_STYLE).toBe(true);
    expect(env.JOBS_DRIVER).toBe('bullmq');
    expect(env.CACHE_DRIVER).toBe('redis');
    expect(env.STORAGE_DRIVER).toBe('local');
  });

  it('lists every invalid or missing key', () => {
    const broken: Record<string, string> = {
      ...validEnv,
      JWT_ACCESS_SECRET: 'short',
      PORT: 'abc',
    };
    delete broken.DATABASE_URL;
    const run = () => validateEnv(broken);

    expect(run).toThrow(/DATABASE_URL/);
    expect(run).toThrow(/JWT_ACCESS_SECRET/);
    expect(run).toThrow(/PORT/);
  });

  it('allows inline jobs and memory cache without Redis outside production', () => {
    const env: Record<string, string> = {
      ...validEnv,
      JOBS_DRIVER: 'inline',
      CACHE_DRIVER: 'memory',
    };
    delete env.REDIS_URL;
    expect(validateEnv(env).JOBS_DRIVER).toBe('inline');
  });

  it('requires REDIS_URL for bullmq/redis drivers', () => {
    const env: Record<string, string> = { ...validEnv };
    delete env.REDIS_URL;
    expect(() => validateEnv(env)).toThrow(/REDIS_URL/);
  });

  it('rejects inline jobs and memory cache in production', () => {
    const run = () =>
      validateEnv({
        ...validEnv,
        NODE_ENV: 'production',
        JOBS_DRIVER: 'inline',
        CACHE_DRIVER: 'memory',
      });
    expect(run).toThrow(/JOBS_DRIVER/);
    expect(run).toThrow(/CACHE_DRIVER/);
  });

  it('rejects placeholder secrets in production', () => {
    const run = () =>
      validateEnv({
        ...validEnv,
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: `change-me-${'x'.repeat(32)}`,
      });

    expect(run).toThrow(/placeholder secret/);
  });

  it('requires different access and refresh secrets in production', () => {
    const run = () =>
      validateEnv({
        ...validEnv,
        NODE_ENV: 'production',
        JWT_REFRESH_SECRET: validEnv.JWT_ACCESS_SECRET,
      });

    expect(run).toThrow(/must differ/);
  });
});
