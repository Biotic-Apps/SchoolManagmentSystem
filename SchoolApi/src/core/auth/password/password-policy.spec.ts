import { assertPasswordPolicy, passwordRules } from './password-policy';

const ok = (
  password: string,
  policy?: Parameters<typeof assertPasswordPolicy>[1],
) => expect(() => assertPasswordPolicy(password, policy)).not.toThrow();
const bad = (
  password: string,
  policy?: Parameters<typeof assertPasswordPolicy>[1],
) => expect(() => assertPasswordPolicy(password, policy)).toThrow();

describe('assertPasswordPolicy', () => {
  it('applies the baseline by default', () => {
    ok('Start1234x');
    bad('Short1x');
    bad('NoDigitsHere');
    bad('1234567890');
    bad('x'.repeat(120) + '123456789');
  });

  it('rejects common passwords regardless of case', () => {
    bad('Password123');
    bad('PAKISTAN123');
  });

  it('honours a longer minimum length', () => {
    const policy = { minLength: 12, requireDigit: true };
    bad('Start1234x', policy);
    ok('Start1234xyz', policy);
  });

  it('never goes below the baseline length', () => {
    bad('Abc1234', { minLength: 4, requireDigit: true });
  });

  it('allows letters-only when digits are not required', () => {
    const policy = { minLength: 10, requireDigit: false };
    ok('CorrectHorse', policy);
    bad('1234567890', policy);
  });

  it('describes the rule', () => {
    expect(passwordRules({ minLength: 10, requireDigit: false })).toBe(
      'At least 10 characters with at least one letter',
    );
  });
});
