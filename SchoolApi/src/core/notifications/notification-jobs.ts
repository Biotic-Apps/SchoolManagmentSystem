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
  /** In-app only, no push (e.g. messages outside office hours). */
  silent?: boolean;
}

/** One-off message with no stored row (e.g. password reset codes, OTPs). */
export interface DirectMessageInput {
  /** Account to reach; or give an explicit address in `to` (no account needed). */
  userId?: string;
  to?: { phone?: string | null; email?: string | null };
  channel: Exclude<NotificationChannel, 'IN_APP'>;
  title: string;
  body: string;
}
