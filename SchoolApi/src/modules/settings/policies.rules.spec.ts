import { DEFAULT_SCHOOL_POLICIES } from '../../core/school-settings/school-policies';
import { RoleKey } from '../../core/rbac/role-key.enum';
import { approvalLimitsProblem, mergePolicies } from './policies.rules';

describe('policy rules', () => {
  it('accepts known approval types with whole amounts', () => {
    expect(
      approvalLimitsProblem({ CONCESSION: 0, EXPENSE: 500000 }),
    ).toBeNull();
  });

  it('rejects unknown types, negatives and fractions', () => {
    expect(approvalLimitsProblem({ SALARY: 1 })).toMatch(/SALARY/);
    expect(approvalLimitsProblem({ REFUND: -1 })).toMatch(/REFUND/);
    expect(approvalLimitsProblem({ REFUND: 1.5 })).toMatch(/REFUND/);
    expect(approvalLimitsProblem({ REFUND: '10' })).toMatch(/REFUND/);
    expect(approvalLimitsProblem([])).toMatch(/map/);
  });

  it('merges a partial patch', () => {
    const merged = mergePolicies(DEFAULT_SCHOOL_POLICIES, {
      sessionTimeoutMinutes: 60,
      passwordPolicy: { minLength: 12 },
      twoFactorRequiredFor: [RoleKey.SUPER_ADMIN, RoleKey.SUPER_ADMIN],
      feeLateFeeDefault: null,
    });
    expect(merged.sessionTimeoutMinutes).toBe(60);
    expect(merged.passwordPolicy).toEqual({
      minLength: 12,
      requireDigit: true,
    });
    expect(merged.twoFactorRequiredFor).toEqual([RoleKey.SUPER_ADMIN]);
    expect(merged.attendanceLockTime).toBe('11:00');
    expect(merged.feeLateFeeDefault).toBeNull();
  });
});
