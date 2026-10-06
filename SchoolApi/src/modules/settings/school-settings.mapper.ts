import { DEFAULT_PRIMARY_COLOR } from '../../core/school-settings/contrast';
import type { SchoolSettingsDto } from './dto/school-settings.dto';
import type { SchoolSettingRow, SettingsSchool } from './settings.repository';

/** Column defaults of `school_settings` (used when no row exists yet). */
export const SCHOOL_SETTING_DEFAULTS = {
  appName: 'eSchool',
  primaryColor: DEFAULT_PRIMARY_COLOR,
  accentSoftColor: '#F6EAF0',
  timezone: 'Asia/Karachi',
  currency: 'PKR',
  locale: 'en-PK',
} as const;

export function toSchoolSettingsDto(
  school: SettingsSchool,
  row: SchoolSettingRow | null,
  logoUrl: string | null,
): SchoolSettingsDto {
  return {
    schoolId: school.id,
    displayName: row?.displayName ?? school.name,
    logoFileId: school.logoFileId,
    logoUrl,
    primaryColor: row?.primaryColor ?? SCHOOL_SETTING_DEFAULTS.primaryColor,
    accentSoftColor:
      row?.accentSoftColor ?? SCHOOL_SETTING_DEFAULTS.accentSoftColor,
    appName: row?.appName ?? SCHOOL_SETTING_DEFAULTS.appName,
    receiptFooter: row?.receiptFooter ?? null,
    reportCardFooter: row?.reportCardFooter ?? null,
    timezone: row?.timezone ?? SCHOOL_SETTING_DEFAULTS.timezone,
    currency: row?.currency ?? SCHOOL_SETTING_DEFAULTS.currency,
    locale: row?.locale ?? SCHOOL_SETTING_DEFAULTS.locale,
  };
}
