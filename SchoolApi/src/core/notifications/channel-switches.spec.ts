import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettings,
} from '../school-settings/notification-settings';
import { allowedChannels, effectiveSwitches } from './channel-switches';

const settings = (
  patch: Partial<NotificationSettings>,
): NotificationSettings => ({
  ...DEFAULT_NOTIFICATION_SETTINGS,
  ...patch,
});

describe('channel switches', () => {
  it('keeps everything on with defaults or no schools', () => {
    expect(effectiveSwitches([], 'FEE')).toEqual({
      EMAIL: true,
      SMS: true,
      PUSH: true,
      WHATSAPP: true,
      IN_APP: true,
    });
    expect(
      allowedChannels(
        ['EMAIL', 'SMS', 'PUSH'],
        effectiveSwitches([DEFAULT_NOTIFICATION_SETTINGS], 'FEE'),
      ),
    ).toEqual(['EMAIL', 'SMS', 'PUSH']);
  });

  it('drops a channel the school switched off', () => {
    const off = settings({ sms: { enabled: false, senderId: null } });
    expect(
      allowedChannels(['EMAIL', 'SMS'], effectiveSwitches([off], 'FEE')),
    ).toEqual(['EMAIL']);
  });

  it('applies per-category defaults', () => {
    const school = settings({
      categories: [
        {
          category: 'DIARY',
          email: false,
          sms: false,
          push: true,
          whatsapp: false,
          inApp: false,
        },
      ],
    });
    const diary = effectiveSwitches([school], 'DIARY');
    expect(allowedChannels(['EMAIL', 'SMS', 'PUSH'], diary)).toEqual(['PUSH']);
    expect(diary.IN_APP).toBe(false);
    expect(effectiveSwitches([school], 'FEE').EMAIL).toBe(true);
  });

  it('keeps a channel on when any school of the recipient allows it', () => {
    const off = settings({ email: { enabled: false, fromName: null } });
    expect(effectiveSwitches([off], 'FEE').EMAIL).toBe(false);
    expect(
      effectiveSwitches([off, DEFAULT_NOTIFICATION_SETTINGS], 'FEE').EMAIL,
    ).toBe(true);
  });

  it('never drops in-app for critical categories', () => {
    const school = settings({
      categories: [
        {
          category: 'HEALTH',
          email: true,
          sms: true,
          push: true,
          whatsapp: true,
          inApp: false,
        },
      ],
    });
    expect(effectiveSwitches([school], 'HEALTH').IN_APP).toBe(true);
  });
});
