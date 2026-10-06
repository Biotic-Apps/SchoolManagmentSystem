import { BullModule } from '@nestjs/bullmq';
import { type DynamicModule, Global, Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { BullmqJobDispatcher } from './bullmq-job.dispatcher';
import { BullmqJobScheduler } from './bullmq-job.scheduler';
import { DEFAULT_JOB_OPTIONS } from './default-job-options';
import { InlineJobDispatcher } from './inline-job.dispatcher';
import { InlineJobScheduler } from './inline-job.scheduler';
import { JobDispatcher } from './job-dispatcher';
import { JobProcessorRegistry } from './job-processor.registry';
import { JobRunner } from './job-runner';
import { JobScheduler } from './job-scheduler';
import { jobsDriverFromEnv } from './jobs-driver';
import { ACTIVE_QUEUES } from './queues';
import { redisOptionsFromUrl } from './redis-connection';
import { registerQueues } from './register-queues';
import { DocumentsWorker } from './workers/documents.worker';
import { MaintenanceWorker } from './workers/maintenance.worker';
import { NotificationsWorker } from './workers/notifications.worker';
import { PayrollWorker } from './workers/payroll.worker';
import { ReportsWorker } from './workers/reports.worker';

const SHARED = [JobProcessorRegistry, JobRunner];
const EXPORTS = [JobDispatcher, JobScheduler, JobProcessorRegistry];

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
          { provide: JobScheduler, useClass: InlineJobScheduler },
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
        { provide: JobScheduler, useClass: BullmqJobScheduler },
        NotificationsWorker,
        DocumentsWorker,
        ReportsWorker,
        PayrollWorker,
        MaintenanceWorker,
      ],
      exports: EXPORTS,
    };
  }
}
