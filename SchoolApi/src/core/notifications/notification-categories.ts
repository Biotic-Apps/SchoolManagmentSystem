export const NOTIFICATION_CATEGORIES = [
  'ATTENDANCE',
  'DIARY',
  'ACTIVITY',
  'CONSENT',
  'NOTICE',
  'MESSAGE',
  'COMPLAINT',
  'MEETING',
  'HEALTH',
  'PICKUP',
  'LEAVE',
  'APPROVAL',
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

/** Safety notifications that users cannot mute. */
export const CRITICAL_CATEGORIES: ReadonlySet<string> = new Set([
  'HEALTH',
  'PICKUP',
]);

export const isCritical = (category: string): boolean =>
  CRITICAL_CATEGORIES.has(category);
