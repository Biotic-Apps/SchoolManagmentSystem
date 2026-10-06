import { Module } from '@nestjs/common';
import { FailedNotificationsRepository } from './failed-notifications.repository';
import { FailedNotificationsService } from './failed-notifications.service';
import { SupportController } from './support.controller';
import { SupportHealthService } from './support-health.service';
import { SupportJobsService } from './support-jobs.service';

/** Phase 5 §C: Settings › Support (failed notifications, jobs, health). */
@Module({
  controllers: [SupportController],
  providers: [
    FailedNotificationsRepository,
    FailedNotificationsService,
    SupportJobsService,
    SupportHealthService,
  ],
})
export class SupportModule {}
