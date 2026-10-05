import type { NotificationChannel } from '../../generated/prisma/client';

export const NOTIFICATION_JOBS = {
  SEND: 'notifications.send',
  DIRECT: 'notifications.direct',
} as const;

export interface NotifyInput {
  userIds: string[];
  category: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  /** External channels in addition to the in-app row. */
  channels?: Exclude<NotificationChannel, 'IN_APP'>[];
}

/** One-off message with no stored row (e.g. password reset codes). */
export interface DirectMessageInput {
  userId: string;
  channel: Exclude<NotificationChannel, 'IN_APP'>;
  title: string;
  body: string;
}
