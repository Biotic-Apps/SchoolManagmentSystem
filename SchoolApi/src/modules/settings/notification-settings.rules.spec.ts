import { NOTIFICATION_CATEGORIES } from '../../core/notifications/notification-categories';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../../core/school-settings/notification-settings';
import {
  categoriesProblem,
  mergeNotificationSettings,
  withAllCategories,
} from './notification-settings.rules';

describe('notification settings rules', () => {
  it('lists every known category with all-on defaults', () => {
    const result = withAllCategories(DEFAULT_NOTIFICATION_SETTINGS);
    expect(result.categories).toHaveLength(NOTIFICATION_CATEGORIES.length);
    expect(result.categories.every((c) => c.email && c.inApp)).toBe(true);
  });

  it('merges a patch over the stored value', () => {
    const merged = mergeNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS, {
      sms: { enabled: false, senderId: '  ' },
      categories: [
        {
          category: 'DIARY',
          email: false,
          sms: false,
          push: true,
          whatsapp: false,
          inApp: true,
        },
      ],
    });
    expect(merged.sms).toEqual({ enabled: false, senderId: null });
    expect(merged.email).toEqual(DEFAULT_NOTIFICATION_SETTINGS.email);
    expect(merged.categories).toEqual([
      { category: 'DIARY', email: false, sms: false, push: true, inApp: true },
    ]);
  });

  it('rejects repeated categories and in-app off for critical ones', () => {
    const row = {
      category: 'FEE',
      email: true,
      sms: true,
      push: true,
      whatsapp: false,
      inApp: true,
    };
    expect(categoriesProblem([row, row])).toMatch(/repeated/);
    expect(
      categoriesProblem([{ ...row, category: 'HEALTH', inApp: false }]),
    ).toMatch(/HEALTH/);
    expect(categoriesProblem([row])).toBeNull();
  });
});
