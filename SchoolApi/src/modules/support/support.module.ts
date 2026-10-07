import { Module } from '@nestjs/common';
import { FailedNotificationsRepository } from './failed-notifications.repository';
import { FailedNotificationsService } from './failed-notifications.service';
import { SupportController } from './support.controller';
import { SupportHealthService } from './support-health.service';
import { SupportJobsService } from './support-jobs.service';
import { TestMessageService } from './test-message.service';

/** Phase 5 §C + Phase 6 §A: Settings › Support (failed notifications, jobs, health, test message). */
@Module({
  controllers: [SupportController],
  providers: [
    FailedNotificationsRepository,
    FailedNotificationsService,
    SupportJobsService,
    SupportHealthService,
    TestMessageService,
  ],
})
export class SupportModule {}
