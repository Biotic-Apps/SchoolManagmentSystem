export const BRANCH_SETTING_DEFAULTS: Readonly<Record<string, unknown>> = {
  'attendance.lockTime': '11:00',
  'diary.moderation': false,
  'diary.closingTime': '15:00',
  'messaging.officeHours': { from: '08:00', to: '16:00' },
  'approval.limits': {},
};

const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Returns an error message, or null when `value` fits the setting's shape. */
export function validateSetting(key: string, value: unknown): string | null {
  if (!(key in BRANCH_SETTING_DEFAULTS)) return `Unknown setting ${key}`;
  const fallback = BRANCH_SETTING_DEFAULTS[key];
  if (typeof fallback === 'string') {
    return typeof value === 'string' && HH_MM.test(value)
      ? null
      : `${key} must be HH:mm`;
  }
  if (typeof fallback === 'boolean') {
    return typeof value === 'boolean' ? null : `${key} must be true or false`;
  }
  if (key === 'messaging.officeHours') {
    const ok =
      isPlainObject(value) &&
      HH_MM.test(String(value.from)) &&
      HH_MM.test(String(value.to));
    return ok ? null : `${key} must be { from: HH:mm, to: HH:mm }`;
  }
  const ok =
    isPlainObject(value) &&
    Object.values(value).every(
      (v) => Number.isInteger(v) && (v as number) >= 0,
    );
  return ok ? null : `${key} must map approval types to amounts in minor units`;
}
