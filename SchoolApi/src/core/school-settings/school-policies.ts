import { RoleKey } from '../rbac/role-key.enum';

/** School-wide policies (phase5-contract §A). Branch settings still override per branch. */
export interface SchoolPolicies {
  attendanceLockTime: string;
  diaryModeration: boolean;
  gradingDefault: string | null;
  feeLateFeeDefault: { amountMinor: number; afterDays: number } | null;
  /** Principal's approval limit per type, `{ CONCESSION: amountMinor }`. */
  approvalLimits: Record<string, number>;
  passwordPolicy: PasswordPolicy;
  sessionTimeoutMinutes: number;
  twoFactorRequiredFor: RoleKey[];
}

export interface PasswordPolicy {
  /** Never below the security baseline of 8. */
  minLength: number;
  requireDigit: boolean;
}

export const BASELINE_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireDigit: true,
};

export const DEFAULT_SCHOOL_POLICIES: SchoolPolicies = {
  attendanceLockTime: '11:00',
  diaryModeration: false,
  gradingDefault: null,
  feeLateFeeDefault: null,
  approvalLimits: {},
  passwordPolicy: { ...BASELINE_PASSWORD_POLICY },
  sessionTimeoutMinutes: 30,
  twoFactorRequiredFor: [],
};

export const SESSION_TIMEOUT_RANGE = { min: 5, max: 1440 } as const;
export const PASSWORD_MIN_LENGTH_RANGE = { min: 8, max: 64 } as const;

/** Stored JSON merged over the defaults (unknown keys dropped). */
export function withPolicyDefaults(stored: unknown): SchoolPolicies {
  const value =
    stored && typeof stored === 'object' && !Array.isArray(stored)
      ? (stored as Partial<SchoolPolicies>)
      : {};
  const merged: SchoolPolicies = { ...DEFAULT_SCHOOL_POLICIES };
  for (const key of Object.keys(
    DEFAULT_SCHOOL_POLICIES,
  ) as (keyof SchoolPolicies)[]) {
    if (value[key] !== undefined)
      (merged as unknown as Record<string, unknown>)[key] = value[key];
  }
  merged.passwordPolicy = {
    ...BASELINE_PASSWORD_POLICY,
    ...(value.passwordPolicy ?? {}),
  };
  return merged;
}

/**
 * Policy that applies to a user in several schools: the strictest one
 * (longest password, digit if any requires it, shortest timeout, union of 2FA roles).
 */
export function strictestPolicies(
  list: SchoolPolicies[],
): Pick<
  SchoolPolicies,
  'passwordPolicy' | 'sessionTimeoutMinutes' | 'twoFactorRequiredFor'
> {
  if (list.length === 0) {
    return {
      passwordPolicy: { ...DEFAULT_SCHOOL_POLICIES.passwordPolicy },
      sessionTimeoutMinutes: DEFAULT_SCHOOL_POLICIES.sessionTimeoutMinutes,
      twoFactorRequiredFor: [],
    };
  }
  return {
    passwordPolicy: {
      minLength: Math.max(
        BASELINE_PASSWORD_POLICY.minLength,
        ...list.map((p) => p.passwordPolicy.minLength),
      ),
      requireDigit: list.some((p) => p.passwordPolicy.requireDigit),
    },
    sessionTimeoutMinutes: Math.min(
      ...list.map((p) => p.sessionTimeoutMinutes),
    ),
    twoFactorRequiredFor: [
      ...new Set(list.flatMap((p) => p.twoFactorRequiredFor)),
    ],
  };
}
