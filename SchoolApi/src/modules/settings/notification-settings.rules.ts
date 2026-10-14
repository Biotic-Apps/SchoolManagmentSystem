import {
  isCritical,
  NOTIFICATION_CATEGORIES,
} from '../../core/notifications/notification-categories';
import type {
  CategoryChannels,
  NotificationSettings,
} from '../../core/school-settings/notification-settings';
import type { UpdateNotificationSettingsDto } from './dto/notification-settings.dto';

const ALL_ON = {
  email: true,
  sms: true,
  push: true,
  whatsapp: false,
  inApp: true,
};

/** Every known category with its effective value (unlisted = all on). */
export function withAllCategories(
  settings: NotificationSettings,
): NotificationSettings {
  const stored = new Map(settings.categories.map((c) => [c.category, c]));
  return {
    ...settings,
    categories: NOTIFICATION_CATEGORIES.map((category) => {
      const row = stored.get(category);
      return {
        category,
        email: row?.email ?? ALL_ON.email,
        sms: row?.sms ?? ALL_ON.sms,
        push: row?.push ?? ALL_ON.push,
        whatsapp: row?.whatsapp ?? ALL_ON.whatsapp,
        inApp: isCritical(category) ? true : (row?.inApp ?? ALL_ON.inApp),
      };
    }),
  };
}

/** Problem with the categories of a PATCH, or null. */
export function categoriesProblem(list: CategoryChannels[]): string | null {
  const seen = new Set<string>();
  for (const row of list) {
    if (seen.has(row.category)) return `Category ${row.category} is repeated`;
    seen.add(row.category);
    if (isCritical(row.category) && !row.inApp) {
      return `In-app notifications cannot be turned off for ${row.category}`;
    }
  }
  return null;
}

/** Applies a PATCH: switches replace, categories replace their own entry. */
export function mergeNotificationSettings(
  current: NotificationSettings,
  patch: UpdateNotificationSettingsDto,
): NotificationSettings {
  const categories = new Map(current.categories.map((c) => [c.category, c]));
  for (const row of patch.categories ?? []) {
    categories.set(row.category, {
      category: row.category,
      email: row.email,
      sms: row.sms,
      push: row.push,
      whatsapp: row.whatsapp ?? false,
      inApp: row.inApp,
    });
  }
  return {
    email: patch.email
      ? {
          enabled: patch.email.enabled,
          fromName: patch.email.fromName?.trim() || null,
        }
      : current.email,
    sms: patch.sms
      ? {
          enabled: patch.sms.enabled,
          senderId: patch.sms.senderId?.trim() || null,
        }
      : current.sms,
    push: patch.push ? { enabled: patch.push.enabled } : current.push,
    whatsapp: patch.whatsapp
      ? { enabled: patch.whatsapp.enabled }
      : current.whatsapp,
    categories: [...categories.values()],
  };
}
