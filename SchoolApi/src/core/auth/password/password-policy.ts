import { invalid } from '../../common/errors/errors';

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

export const PASSWORD_RULES =
  'At least 8 characters with at least one letter and one digit';

/** security.md §1: min 8, letter + digit, not a common password. */
export function assertPasswordPolicy(password: string): void {
  const valid =
    password.length >= 8 &&
    password.length <= 128 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password);
  if (!valid) throw invalid(`Password rule: ${PASSWORD_RULES}`);
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    throw invalid('Password is too common');
  }
}
