import type { SchoolPolicies } from '../../core/school-settings/school-policies';
import type { UpdatePoliciesDto } from './dto/policies.dto';

export const APPROVAL_LIMIT_TYPES = [
  'CONCESSION',
  'REFUND',
  'EXPENSE',
  'PURCHASE_ORDER',
] as const;

const MAX_LIMIT_MINOR = Number.MAX_SAFE_INTEGER;

/** Problem with an `approvalLimits` map, or null. */
export function approvalLimitsProblem(value: unknown): string | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return 'approvalLimits must map approval types to amounts';
  }
  for (const [type, amount] of Object.entries(value)) {
    if (!(APPROVAL_LIMIT_TYPES as readonly string[]).includes(type)) {
      return `approvalLimits.${type} is not one of ${APPROVAL_LIMIT_TYPES.join(', ')}`;
    }
    if (
      !Number.isInteger(amount) ||
      (amount as number) < 0 ||
      (amount as number) > MAX_LIMIT_MINOR
    ) {
      return `approvalLimits.${type} must be a whole amount in minor units (0 or more)`;
    }
  }
  return null;
}

/** Applies a PATCH over the current policies (top-level merge). */
export function mergePolicies(
  current: SchoolPolicies,
  patch: UpdatePoliciesDto,
): SchoolPolicies {
  return {
    attendanceLockTime: patch.attendanceLockTime ?? current.attendanceLockTime,
    diaryModeration: patch.diaryModeration ?? current.diaryModeration,
    gradingDefault:
      patch.gradingDefault === undefined
        ? current.gradingDefault
        : patch.gradingDefault,
    feeLateFeeDefault:
      patch.feeLateFeeDefault === undefined
        ? current.feeLateFeeDefault
        : patch.feeLateFeeDefault && {
            amountMinor: patch.feeLateFeeDefault.amountMinor,
            afterDays: patch.feeLateFeeDefault.afterDays,
          },
    approvalLimits: patch.approvalLimits
      ? { ...patch.approvalLimits }
      : current.approvalLimits,
    passwordPolicy: {
      minLength:
        patch.passwordPolicy?.minLength ?? current.passwordPolicy.minLength,
      requireDigit:
        patch.passwordPolicy?.requireDigit ??
        current.passwordPolicy.requireDigit,
    },
    sessionTimeoutMinutes:
      patch.sessionTimeoutMinutes ?? current.sessionTimeoutMinutes,
    twoFactorRequiredFor: patch.twoFactorRequiredFor
      ? [...new Set(patch.twoFactorRequiredFor)]
      : current.twoFactorRequiredFor,
  };
}
