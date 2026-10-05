import { BullModule } from '@nestjs/bullmq';
import { type DynamicModule, Global, Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { BullmqJobDispatcher } from './bullmq-job.dispatcher';
import { DEFAULT_JOB_OPTIONS } from './default-job-options';
import { InlineJobDispatcher } from './inline-job.dispatcher';
import { JobDispatcher } from './job-dispatcher';
import { JobProcessorRegistry } from './job-processor.registry';
import { JobRunner } from './job-runner';
import { jobsDriverFromEnv } from './jobs-driver';
import { ACTIVE_QUEUES } from './queues';
import { redisOptionsFromUrl } from './redis-connection';
import { registerQueues } from './register-queues';
import { MaintenanceWorker } from './workers/maintenance.worker';
import { NotificationsWorker } from './workers/notifications.worker';

const SHARED = [JobProcessorRegistry, JobRunner];
const EXPORTS = [JobDispatcher, JobProcessorRegistry];

@Global()
@Module({})
export class JobsModule {
  static forRoot(): DynamicModule {
    if (jobsDriverFromEnv() === 'inline') {
      return {
        module: JobsModule,
        providers: [
          ...SHARED,
          { provide: JobDispatcher, useClass: InlineJobDispatcher },
        ],
        exports: EXPORTS,
      };
    }
    return {
      module: JobsModule,
      imports: [
        BullModule.forRootAsync({
          inject: [AppConfigService],
          useFactory: (config: AppConfigService) => ({
            connection: redisOptionsFromUrl(config.get('REDIS_URL') ?? ''),
            defaultJobOptions: DEFAULT_JOB_OPTIONS,
          }),
        }),
        registerQueues(...ACTIVE_QUEUES),
      ],
      providers: [
        ...SHARED,
        { provide: JobDispatcher, useClass: BullmqJobDispatcher },
        NotificationsWorker,
        MaintenanceWorker,
      ],
      exports: EXPORTS,
    };
  }
}
