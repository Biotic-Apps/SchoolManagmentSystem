import { z } from 'zod';

const secret = z.string().min(32, 'must be at least 32 characters');

const commaList = z.string().transform((value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0),
);

const booleanString = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

/** Base64 text that decodes to exactly 32 bytes (AES-256 key). */
const base64Key = z
  .string()
  .refine(
    (value) =>
      /^[A-Za-z0-9+/]+={0,2}$/.test(value) &&
      Buffer.from(value, 'base64').length === 32,
    'must be 32 random bytes encoded as base64',
  );

const PLACEHOLDER_SECRETS = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'FILE_URL_SECRET',
] as const;

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    APP_URL: z.url().default('http://localhost:3000'),
    APP_TIMEZONE: z
      .string()
      .default('Asia/Karachi')
      .refine(
        (tz) => Intl.supportedValuesOf('timeZone').includes(tz) || tz === 'UTC',
        'Unknown IANA time zone',
      ),
    DATABASE_URL: z
      .string()
      .regex(/^postgres(ql)?:\/\//, 'must be a postgresql:// URL'),
    REDIS_URL: z
      .string()
      .regex(/^rediss?:\/\//, 'must be a redis:// URL')
      .optional(),
    JOBS_DRIVER: z.enum(['bullmq', 'inline']).default('bullmq'),
    CACHE_DRIVER: z.enum(['redis', 'memory']).default('redis'),
    JWT_ACCESS_SECRET: secret,
    JWT_REFRESH_SECRET: secret,
    JWT_ACCESS_TTL: z
      .string()
      .regex(/^\d+[smhd]$/, 'use a duration like 15m')
      .default('15m'),
    REFRESH_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
    THROTTLE_LIMIT: z.coerce.number().int().min(1).default(300),
    AUTH_THROTTLE_LIMIT: z.coerce.number().int().min(1).default(10),
    CORS_ORIGINS: commaList.default([]),
    /**
     * Express `trust proxy` allow-list (IPs/CIDRs or loopback/linklocal/uniquelocal),
     * comma-separated. Unset = loopback outside production, nobody in production.
     * req.ip then = right-most untrusted X-Forwarded-For entry (throttling, audit).
     */
    TRUSTED_PROXIES: commaList.optional(),
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    STORAGE_LOCAL_DIR: z.string().min(1).default('storage'),
    FILE_URL_SECRET: secret,
    /** Unset = AWS endpoint for S3_REGION; set for MinIO / R2. */
    S3_ENDPOINT: z.url().optional(),
    S3_REGION: z.string().min(1).default('us-east-1'),
    S3_BUCKET: z.string().min(1).optional(),
    S3_ACCESS_KEY: z.string().min(1).optional(),
    S3_SECRET_KEY: z.string().min(1).optional(),
    S3_FORCE_PATH_STYLE: booleanString.default(true),
    /** ClamAV daemon (clamd TCP). Unset = uploads are not scanned. */
    CLAMAV_HOST: z.string().min(1).optional(),
    CLAMAV_PORT: z.coerce.number().int().min(1).max(65535).default(3310),
    /** 32 random bytes, base64. Required in production (backups are always encrypted). */
    BACKUP_ENCRYPTION_KEY: base64Key.optional(),
    BACKUP_RETENTION_DAILY: z.coerce.number().int().min(1).max(366).default(30),
    BACKUP_RETENTION_MONTHLY: z.coerce
      .number()
      .int()
      .min(0)
      .max(120)
      .default(12),
    /** pg_dump / pg_restore binaries; unset = found on PATH (dev falls back to the built-in COPY dump). */
    PG_DUMP_PATH: z.string().min(1).optional(),
    PG_RESTORE_PATH: z.string().min(1).optional(),
    TOTP_ISSUER: z.string().min(1).max(40).default('eSchool'),
    /** 32 bytes base64 for TOTP secrets at rest; unset = derived from JWT_REFRESH_SECRET (HKDF). */
    TWO_FACTOR_ENCRYPTION_KEY: base64Key.optional(),
    /** Firebase service account (JSON text or a file path); unset = push is logged. */
    FCM_SERVICE_ACCOUNT_JSON: z.string().min(1).optional(),
  })
  .superRefine((env, ctx) => {
    const needsRedis =
      env.JOBS_DRIVER === 'bullmq' || env.CACHE_DRIVER === 'redis';
    if (needsRedis && !env.REDIS_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['REDIS_URL'],
        message: 'required when JOBS_DRIVER=bullmq or CACHE_DRIVER=redis',
      });
    }
    if (env.STORAGE_DRIVER === 's3') {
      for (const key of [
        'S3_BUCKET',
        'S3_ACCESS_KEY',
        'S3_SECRET_KEY',
      ] as const) {
        if (!env[key]) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: 'required when STORAGE_DRIVER=s3',
          });
        }
      }
    }
    if (env.NODE_ENV !== 'production') return;

    if (!env.BACKUP_ENCRYPTION_KEY) {
      ctx.addIssue({
        code: 'custom',
        path: ['BACKUP_ENCRYPTION_KEY'],
        message: 'required in production (backups are encrypted)',
      });
    }
    if (
      env.STORAGE_DRIVER === 's3' &&
      env.S3_SECRET_KEY?.startsWith('change-me')
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['S3_SECRET_KEY'],
        message: 'placeholder secret is not allowed in production',
      });
    }

    for (const key of PLACEHOLDER_SECRETS) {
      if (env[key].startsWith('change-me')) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: 'placeholder secret is not allowed in production',
        });
      }
    }
    if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT_REFRESH_SECRET'],
        message: 'must differ from JWT_ACCESS_SECRET',
      });
    }
    if (env.JOBS_DRIVER === 'inline') {
      ctx.addIssue({
        code: 'custom',
        path: ['JOBS_DRIVER'],
        message: 'inline jobs are not allowed in production',
      });
    }
    if (env.CACHE_DRIVER === 'memory') {
      ctx.addIssue({
        code: 'custom',
        path: ['CACHE_DRIVER'],
        message: 'memory cache is not allowed in production',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;
