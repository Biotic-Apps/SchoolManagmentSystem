import { primaryColorProblem } from '../../core/school-settings/contrast';
import type { UpdateSchoolSettingsDto } from './dto/update-school-settings.dto';

export function isIanaTimeZone(value: string): boolean {
  if (!/^[A-Za-z_]+(\/[A-Za-z0-9_+-]+)*$/.test(value)) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function isLocaleTag(value: string): boolean {
  try {
    return Intl.getCanonicalLocales(value).length === 1;
  } catch {
    return false;
  }
}

/** First problem with the school settings input, or null. */
export function schoolSettingsProblem(
  dto: UpdateSchoolSettingsDto,
): string | null {
  if (dto.primaryColor !== undefined) {
    const problem = primaryColorProblem(dto.primaryColor);
    if (problem) return problem;
  }
  if (dto.timezone !== undefined && !isIanaTimeZone(dto.timezone)) {
    return 'timezone must be an IANA time zone such as Asia/Karachi';
  }
  if (dto.locale !== undefined && !isLocaleTag(dto.locale)) {
    return 'locale must be a language tag such as en-PK';
  }
  return null;
}
