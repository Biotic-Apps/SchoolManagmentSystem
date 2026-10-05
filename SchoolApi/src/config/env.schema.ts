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
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    STORAGE_LOCAL_DIR: z.string().min(1).default('storage'),
    FILE_URL_SECRET: secret,
    S3_ENDPOINT: z.url(),
    S3_REGION: z.string().min(1).default('us-east-1'),
    S3_BUCKET: z.string().min(1),
    S3_ACCESS_KEY: z.string().min(1),
    S3_SECRET_KEY: z.string().min(1),
    S3_FORCE_PATH_STYLE: booleanString.default(true),
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
    if (env.NODE_ENV !== 'production') return;

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
