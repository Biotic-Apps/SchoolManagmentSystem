import { Injectable } from '@nestjs/common';
import { NotificationService } from '../../core/notifications/notification.service';

/**
 * Welcome message to a new principal, queued after commit (background job).
 * Sign-in instructions only: the password is never part of a notification.
 */
@Injectable()
export class WelcomeNotifier {
  constructor(private readonly notifications: NotificationService) {}

  send(
    userId: string,
    schoolName: string,
    branchName: string,
    contact: { email: string | null; phone: string | null },
  ): Promise<void> {
    const signInWith = contact.email ?? contact.phone ?? '';
    return this.notifications.notify({
      userIds: [userId],
      category: 'ROLE',
      title: `Welcome to ${schoolName}`,
      body:
        `You are the principal of ${branchName}. Sign in with ${signInWith} ` +
        'and the password your administrator gave you; you will be asked to choose your own.',
      data: { kind: 'SCHOOL_WELCOME' },
      channels: ['EMAIL', 'SMS'],
    });
  }
}
