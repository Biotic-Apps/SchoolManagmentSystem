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

  const productionEnv = {
    ...validEnv,
    NODE_ENV: 'production',
    BACKUP_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
    EMAIL_DRIVER: 'smtp',
    SMTP_HOST: 'smtp.example.com',
    EMAIL_FROM: 'eSchool <no-reply@example.com>',
    SMS_DRIVER: 'http',
    SMS_HTTP_URL: 'https://sms.example.com/send',
  };

  it('accepts a complete production environment', () => {
    expect(validateEnv(productionEnv).NODE_ENV).toBe('production');
  });

  it('requires BACKUP_ENCRYPTION_KEY in production', () => {
    const env: Record<string, string> = { ...productionEnv };
    delete env.BACKUP_ENCRYPTION_KEY;
    expect(() => validateEnv(env)).toThrow(/BACKUP_ENCRYPTION_KEY/);
    expect(validateEnv({ ...env, NODE_ENV: 'development' }).NODE_ENV).toBe(
      'development',
    );
  });

  it('rejects backup keys that are not 32 base64 bytes', () => {
    const run = (key: string) => () =>
      validateEnv({ ...productionEnv, BACKUP_ENCRYPTION_KEY: key });
    expect(run(Buffer.alloc(16, 1).toString('base64'))).toThrow(
      /BACKUP_ENCRYPTION_KEY/,
    );
    expect(run('not base64 at all!')).toThrow(/BACKUP_ENCRYPTION_KEY/);
  });

  it('requires bucket and credentials only for the s3 driver', () => {
    const local: Record<string, string> = { ...validEnv };
    delete local.S3_BUCKET;
    delete local.S3_ACCESS_KEY;
    delete local.S3_ENDPOINT;
    expect(validateEnv(local).STORAGE_DRIVER).toBe('local');
    expect(() => validateEnv({ ...local, STORAGE_DRIVER: 's3' })).toThrow(
      /S3_BUCKET/,
    );
  });

  it('defaults Phase 5 settings', () => {
    const env = validateEnv(validEnv);
    expect(env.BACKUP_RETENTION_DAILY).toBe(30);
    expect(env.BACKUP_RETENTION_MONTHLY).toBe(12);
    expect(env.TOTP_ISSUER).toBe('eSchool');
    expect(env.CLAMAV_PORT).toBe(3310);
  });

  describe('delivery channels (Phase 6)', () => {
    it('defaults to the log drivers outside production', () => {
      const env = validateEnv(validEnv);
      expect(env.EMAIL_DRIVER).toBe('log');
      expect(env.SMS_DRIVER).toBe('log');
      expect(env.SMTP_PORT).toBe(587);
      expect(env.SMTP_SECURE).toBe(false);
      expect(env.SMS_HTTP_METHOD).toBe('POST');
      expect(env.DEFAULT_PHONE_COUNTRY).toBe('+92');
      expect(env.ALLOW_LOG_CHANNELS).toBe(false);
    });

    it('refuses the log drivers in production unless explicitly allowed', () => {
      const run = (extra: Record<string, string>) => () =>
        validateEnv({
          ...productionEnv,
          EMAIL_DRIVER: 'log',
          SMS_DRIVER: 'log',
          ...extra,
        });
      expect(run({})).toThrow(/EMAIL_DRIVER: log driver/);
      expect(run({})).toThrow(/SMS_DRIVER: log driver/);
      expect(run({ ALLOW_LOG_CHANNELS: 'true' })()).toMatchObject({
        ALLOW_LOG_CHANNELS: true,
      });
    });

    it('requires the settings of the selected drivers', () => {
      const run = (extra: Record<string, string>) => () =>
        validateEnv({ ...validEnv, ...extra });
      expect(run({ EMAIL_DRIVER: 'smtp' })).toThrow(/SMTP_HOST/);
      expect(run({ EMAIL_DRIVER: 'smtp' })).toThrow(/EMAIL_FROM/);
      expect(run({ SMS_DRIVER: 'twilio' })).toThrow(/TWILIO_AUTH_TOKEN/);
      expect(run({ SMS_DRIVER: 'http' })).toThrow(/SMS_HTTP_URL/);
    });

    it('parses SMS_HTTP_HEADERS as a JSON object of strings', () => {
      const env = validateEnv({
        ...validEnv,
        SMS_HTTP_HEADERS: '{"Authorization":"Bearer x"}',
      });
      expect(env.SMS_HTTP_HEADERS).toEqual({ Authorization: 'Bearer x' });
      expect(() =>
        validateEnv({ ...validEnv, SMS_HTTP_HEADERS: '[1]' }),
      ).toThrow(/SMS_HTTP_HEADERS/);
      expect(() =>
        validateEnv({ ...validEnv, SMS_HTTP_HEADERS: 'not json' }),
      ).toThrow(/SMS_HTTP_HEADERS/);
    });

    it('validates DEFAULT_PHONE_COUNTRY', () => {
      expect(() =>
        validateEnv({ ...validEnv, DEFAULT_PHONE_COUNTRY: '92' }),
      ).toThrow(/DEFAULT_PHONE_COUNTRY/);
    });
  });
});
