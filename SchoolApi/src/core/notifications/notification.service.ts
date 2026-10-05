import { Injectable } from '@nestjs/common';
import { JobDispatcher } from '../jobs/job-dispatcher';
import { QUEUES } from '../jobs/queues';
import {
  NOTIFICATION_JOBS,
  type DirectMessageInput,
  type NotifyInput,
} from './notification-jobs';

/** Entry point for other modules; all work happens in background jobs. */
@Injectable()
export class NotificationService {
  constructor(private readonly jobs: JobDispatcher) {}

  async notify(input: NotifyInput): Promise<void> {
    const userIds = [...new Set(input.userIds)];
    if (userIds.length === 0) return;
    await this.jobs.dispatch(QUEUES.NOTIFICATIONS, NOTIFICATION_JOBS.SEND, {
      ...input,
      userIds,
    });
  }

  sendDirect(input: DirectMessageInput): Promise<void> {
    return this.jobs.dispatch(
      QUEUES.NOTIFICATIONS,
      NOTIFICATION_JOBS.DIRECT,
      input,
    );
  }
}
