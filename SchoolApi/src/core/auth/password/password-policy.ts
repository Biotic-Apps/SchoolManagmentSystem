import { invalid } from '../../common/errors/errors';
import {
  BASELINE_PASSWORD_POLICY,
  type PasswordPolicy,
} from '../../school-settings/school-policies';

const COMMON_PASSWORDS = new Set([
  'password1',
  'password123',
  'passw0rd',
  '12345678a',
  'a12345678',
  'abc12345',
  'abcd1234',
  'qwerty123',
  'qwerty12',
  'letmein1',
  'welcome1',
  'admin123',
  'iloveyou1',
  'pakistan1',
  'pakistan123',
  'school123',
]);

const MAX_LENGTH = 128;

export const PASSWORD_RULES =
  'At least 8 characters with at least one letter and one digit';

/** Human-readable rule for a policy, e.g. "At least 10 characters ...". */
export function passwordRules(policy: PasswordPolicy): string {
  const min = Math.max(policy.minLength, BASELINE_PASSWORD_POLICY.minLength);
  return `At least ${min} characters with at least one letter${
    policy.requireDigit ? ' and one digit' : ''
  }`;
}

/**
 * security.md §1 + the school's passwordPolicy: never weaker than the
 * baseline length of 8; a letter is always required; not a common password.
 */
export function assertPasswordPolicy(
  password: string,
  policy: PasswordPolicy = BASELINE_PASSWORD_POLICY,
): void {
  const min = Math.max(policy.minLength, BASELINE_PASSWORD_POLICY.minLength);
  const valid =
    password.length >= min &&
    password.length <= MAX_LENGTH &&
    /[A-Za-z]/.test(password) &&
    (!policy.requireDigit || /\d/.test(password));
  if (!valid) throw invalid(`Password rule: ${passwordRules(policy)}`);
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    throw invalid('Password is too common');
  }
}
