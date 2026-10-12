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

/** JSON object of header name → value (SMS_HTTP_HEADERS). */
const jsonHeaders = z.string().transform((value, ctx) => {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      Object.values(parsed).every((v) => typeof v === 'string')
    ) {
      return parsed as Record<string, string>;
    }
  } catch {
    // reported below
  }
  ctx.addIssue({
    code: 'custom',
    message: 'must be a JSON object of string header values',
  });
  return z.NEVER;
});

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
    /** Public address of the school web app (parents' sign-in page, login slips, emails). */
    PUBLIC_WEB_URL: z.url().optional(),
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
    /** log (default) = messages are only logged; smtp = real email. */
    EMAIL_DRIVER: z.enum(['log', 'smtp']).default('log'),
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
    /** true = implicit TLS (465); false = STARTTLS upgrade (587). */
    SMTP_SECURE: booleanString.default(false),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASSWORD: z.string().min(1).optional(),
    /** `eSchool <no-reply@school.pk>`; school fromName replaces the display name. */
    EMAIL_FROM: z.string().min(3).optional(),
    /**
     * Local development only: with EMAIL_DRIVER=log the sign-in code is also
     * returned by POST /auth/otp/request. Refused in production.
     */
    OTP_DEV_ECHO: booleanString.default(false),
    /** log (default), twilio, or http (any local SMS gateway). */
    SMS_DRIVER: z.enum(['log', 'twilio', 'http']).default('log'),
    TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
    TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
    TWILIO_FROM: z.string().min(1).optional(),
    SMS_HTTP_URL: z.url().optional(),
    SMS_HTTP_METHOD: z.enum(['POST', 'PUT', 'GET']).default('POST'),
    SMS_HTTP_HEADERS: jsonHeaders.optional(),
    /** Body template with {{to}}, {{message}}, {{senderId}}; unset = JSON body. */
    SMS_HTTP_BODY: z.string().min(1).optional(),
    /** Staging only: lets production run with the log email/SMS drivers. */
    ALLOW_LOG_CHANNELS: booleanString.default(false),
    /** Staging only: lets production run with inline jobs and memory cache (no Redis). */
    ALLOW_DEV_DRIVERS: booleanString.default(false),
    /** Country code for numbers written without one (E.164 normalisation). */
    DEFAULT_PHONE_COUNTRY: z
      .string()
      .regex(/^\+[1-9]\d{0,3}$/, 'use a country code like +92')
      .default('+92'),
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
    for (const [key, message] of channelIssues(env)) {
      ctx.addIssue({ code: 'custom', path: [key], message });
    }
    if (env.NODE_ENV !== 'production') return;

    if (!env.ALLOW_LOG_CHANNELS) {
      for (const key of ['EMAIL_DRIVER', 'SMS_DRIVER'] as const) {
        if (env[key] === 'log') {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message:
              'log driver is not allowed in production (set ALLOW_LOG_CHANNELS=true for staging)',
          });
        }
      }
    }

    if (env.OTP_DEV_ECHO) {
      ctx.addIssue({
        code: 'custom',
        path: ['OTP_DEV_ECHO'],
        message: 'must be false in production (it reveals sign-in codes)',
      });
    }

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
    if (!env.ALLOW_DEV_DRIVERS) {
      if (env.JOBS_DRIVER === 'inline') {
        ctx.addIssue({
          code: 'custom',
          path: ['JOBS_DRIVER'],
          message:
            'inline jobs are not allowed in production (set ALLOW_DEV_DRIVERS=true for staging)',
        });
      }
      if (env.CACHE_DRIVER === 'memory') {
        ctx.addIssue({
          code: 'custom',
          path: ['CACHE_DRIVER'],
          message:
            'memory cache is not allowed in production (set ALLOW_DEV_DRIVERS=true for staging)',
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

type ChannelEnv = Pick<
  Env,
  | 'EMAIL_DRIVER'
  | 'SMTP_HOST'
  | 'EMAIL_FROM'
  | 'SMS_DRIVER'
  | 'TWILIO_ACCOUNT_SID'
  | 'TWILIO_AUTH_TOKEN'
  | 'TWILIO_FROM'
  | 'SMS_HTTP_URL'
>;

/** Settings each selected email/SMS driver needs: `[key, message]`. */
function channelIssues(env: ChannelEnv): [keyof ChannelEnv, string][] {
  const required: Record<string, (keyof ChannelEnv)[]> = {
    smtp: ['SMTP_HOST', 'EMAIL_FROM'],
    twilio: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM'],
    http: ['SMS_HTTP_URL'],
  };
  const issues: [keyof ChannelEnv, string][] = [];
  for (const driver of [env.EMAIL_DRIVER, env.SMS_DRIVER]) {
    for (const key of required[driver] ?? []) {
      if (!env[key]) issues.push([key, `required when driver is ${driver}`]);
    }
  }
  return issues;
}
