import { Injectable } from '@nestjs/common';
import { NotificationService } from '../../core/notifications/notification.service';
import { guardiansOf } from './application.mapper';
import type { ApplicationRow } from './applications.repository';

/** Applicants have no account yet: message the primary guardian directly. */
@Injectable()
export class ApplicantNotifier {
  constructor(private readonly notifications: NotificationService) {}

  async notify(
    row: ApplicationRow,
    title: string,
    body: string,
  ): Promise<void> {
    const guardians = guardiansOf(row);
    const primary = guardians.find((g) => g.isPrimary) ?? guardians[0];
    if (!primary) return;
    await this.notifications.sendDirect({
      to: { phone: primary.phone, email: primary.email },
      channel: 'SMS',
      title,
      body: `${row.applicationNo}: ${body}`,
    });
  }
}
