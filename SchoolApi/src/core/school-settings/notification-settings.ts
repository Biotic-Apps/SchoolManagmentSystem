/** School notification switches (phase5-contract §A). */
export interface NotificationSettings {
  email: { enabled: boolean; fromName: string | null };
  sms: { enabled: boolean; senderId: string | null };
  push: { enabled: boolean };
  /** Per-category channel defaults; categories not listed use all-on. */
  categories: CategoryChannels[];
}

export interface CategoryChannels {
  category: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: { enabled: true, fromName: null },
  sms: { enabled: true, senderId: null },
  push: { enabled: true },
  categories: [],
};

export function withNotificationDefaults(
  stored: unknown,
): NotificationSettings {
  const value =
    stored && typeof stored === 'object' && !Array.isArray(stored)
      ? (stored as Partial<NotificationSettings>)
      : {};
  return {
    email: { ...DEFAULT_NOTIFICATION_SETTINGS.email, ...(value.email ?? {}) },
    sms: { ...DEFAULT_NOTIFICATION_SETTINGS.sms, ...(value.sms ?? {}) },
    push: { ...DEFAULT_NOTIFICATION_SETTINGS.push, ...(value.push ?? {}) },
    categories: Array.isArray(value.categories) ? value.categories : [],
  };
}
