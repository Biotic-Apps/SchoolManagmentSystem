export type JobsDriver = 'bullmq' | 'inline';

/** Read at module-definition time (ConfigModule has already loaded .env). */
export function jobsDriverFromEnv(): JobsDriver {
  return process.env.JOBS_DRIVER === 'inline' ? 'inline' : 'bullmq';
}
