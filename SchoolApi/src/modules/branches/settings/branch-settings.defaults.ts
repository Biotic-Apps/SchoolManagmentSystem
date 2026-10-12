import {
  BANK_ACCOUNT_KEY,
  bankAccountError,
  CHALLAN_NOTE_KEY,
  EMPTY_BANK_ACCOUNT,
} from '../../fees/challans/bank-account';

export const BRANCH_SETTING_DEFAULTS: Readonly<Record<string, unknown>> = {
  'attendance.lockTime': '11:00',
  'diary.moderation': false,
  'diary.closingTime': '15:00',
  'messaging.officeHours': { from: '08:00', to: '16:00' },
  'approval.limits': {},
  'notices.requireApproval': true,
  'messaging.reviewProbation': false,
  'complaints.slaHours': 48,
  'fees.proofUpload': true,
  'fees.onlineGateway': 'NONE',
  'fees.receiptFooter': '',
  // Fee challans: deposit account printed on every copy, plus a short note.
  [BANK_ACCOUNT_KEY]: EMPTY_BANK_ACCOUNT,
  [CHALLAN_NOTE_KEY]: '',
  // Phase 4 §H: per approval type, { ROLE: amountMinor } a role may approve alone.
  'approval.limits.CONCESSION': { PRINCIPAL: 2_500_000 },
  'approval.limits.REFUND': { PRINCIPAL: 2_500_000 },
  'approval.limits.EXPENSE': { PRINCIPAL: 10_000_000 },
  'approval.limits.PURCHASE_ORDER': { PRINCIPAL: 10_000_000 },
  'exams.positionsEnabled': true,
  'promotion.minPassPercent': 33,
  // academics-timetable-contract §4: teacher lessons per day before a TEACHER_DAY_LIMIT warning.
  'timetable.maxPeriodsPerDay': 7,
};

/** Online gateways known to the registry ("NONE" disables online payment). */
export const ONLINE_GATEWAYS = ['NONE', 'MANUAL', 'JAZZCASH', 'EASYPAISA'] as const;

const FREE_TEXT_SETTINGS: Record<string, number> = {
  'fees.receiptFooter': 300,
  [CHALLAN_NOTE_KEY]: 300,
};

const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Returns an error message, or null when `value` fits the setting's shape. */
export function validateSetting(key: string, value: unknown): string | null {
  if (!(key in BRANCH_SETTING_DEFAULTS)) return `Unknown setting ${key}`;
  const fallback = BRANCH_SETTING_DEFAULTS[key];
  if (key in FREE_TEXT_SETTINGS) {
    return typeof value === 'string' && value.length <= FREE_TEXT_SETTINGS[key]
      ? null
      : `${key} must be text of at most ${FREE_TEXT_SETTINGS[key]} characters`;
  }
  if (key === BANK_ACCOUNT_KEY) return bankAccountError(value);
  if (key === 'fees.onlineGateway') {
    return ONLINE_GATEWAYS.includes(value as (typeof ONLINE_GATEWAYS)[number])
      ? null
      : `${key} must be one of ${ONLINE_GATEWAYS.join(', ')}`;
  }
  if (key === 'promotion.minPassPercent') {
    return Number.isInteger(value) &&
      (value as number) >= 0 &&
      (value as number) <= 100
      ? null
      : `${key} must be a whole percent 0-100`;
  }
  if (typeof fallback === 'string') {
    return typeof value === 'string' && HH_MM.test(value)
      ? null
      : `${key} must be HH:mm`;
  }
  if (typeof fallback === 'number') {
    const positive = (v: unknown) => Number.isInteger(v) && (v as number) > 0;
    const ok =
      positive(value) ||
      (isPlainObject(value) && Object.values(value).every(positive));
    return ok
      ? null
      : `${key} must be a positive whole number (or a map of them)`;
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
