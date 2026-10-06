import type { NotificationChannel } from '../../generated/prisma/client';
import type { NotificationSettings } from '../school-settings/notification-settings';
import { isCritical } from './notification-categories';

export type ExternalChannel = Exclude<NotificationChannel, 'IN_APP'>;

export interface ChannelSwitches {
  EMAIL: boolean;
  SMS: boolean;
  PUSH: boolean;
  IN_APP: boolean;
}

const ALL_ON: ChannelSwitches = {
  EMAIL: true,
  SMS: true,
  PUSH: true,
  IN_APP: true,
};

/** One school's switches for a category (school switch AND category default). */
function forSchool(
  settings: NotificationSettings,
  category: string,
): ChannelSwitches {
  const row = settings.categories.find((c) => c.category === category);
  return {
    EMAIL: settings.email.enabled && (row?.email ?? true),
    SMS: settings.sms.enabled && (row?.sms ?? true),
    PUSH: settings.push.enabled && (row?.push ?? true),
    IN_APP: row?.inApp ?? true,
  };
}

/**
 * Effective switches for a recipient in several schools: a channel stays on
 * when any of their schools allows it. No schools known = everything on.
 * Critical (safety) categories always keep the in-app row.
 */
export function effectiveSwitches(
  schools: NotificationSettings[],
  category: string,
): ChannelSwitches {
  const result =
    schools.length === 0
      ? { ...ALL_ON }
      : schools
          .map((settings) => forSchool(settings, category))
          .reduce((a, b) => ({
            EMAIL: a.EMAIL || b.EMAIL,
            SMS: a.SMS || b.SMS,
            PUSH: a.PUSH || b.PUSH,
            IN_APP: a.IN_APP || b.IN_APP,
          }));
  if (isCritical(category)) result.IN_APP = true;
  return result;
}

/** Drops the external channels the school switches turn off. */
export function allowedChannels(
  requested: ExternalChannel[],
  switches: ChannelSwitches,
): ExternalChannel[] {
  return requested.filter((channel) => switches[channel]);
}
