import { ErrorCode } from '../../core/common/errors/error-code.enum';
import { Scope } from '../../core/rbac/scope/scope';
import { ScopeService } from '../../core/rbac/scope/scope.service';
import { assertCanGrant, type GrantTarget } from './grant-rules';

const principalScope = ScopeService.resolve([
  {
    id: 'a',
    roleId: 'r',
    roleKey: 'PRINCIPAL',
    roleName: 'Principal',
    scopeType: 'BRANCH',
    schoolId: 'school',
    schoolName: null,
    branchId: 'branch',
    branchName: null,
    sectionId: null,
    subjectId: null,
    validFrom: new Date(0).toISOString(),
    validUntil: null,
  },
]);
const principal = { userId: 'p', isSuperAdmin: false, scope: principalScope };
const admin = {
  userId: 'admin',
  isSuperAdmin: true,
  scope: Scope.createGlobal(),
};

const target = (overrides: Partial<GrantTarget> = {}): GrantTarget => ({
  targetUserId: 'u',
  roleKey: 'TEACHER',
  roleSchoolId: null,
  scopeType: 'BRANCH',
  schoolId: 'school',
  branchId: 'branch',
  ...overrides,
});

const codeOf = (fn: () => void) => {
  try {
    fn();
    return 'ok';
  } catch (error) {
    return (error as { code: string }).code;
  }
};

describe('assertCanGrant', () => {
  it('lets a principal grant staff roles in their branch', () => {
    expect(codeOf(() => assertCanGrant(principal, target()))).toBe('ok');
  });

  it('blocks principals from granting PRINCIPAL or SUPER_ADMIN', () => {
    expect(
      codeOf(() => assertCanGrant(principal, target({ roleKey: 'PRINCIPAL' }))),
    ).toBe(ErrorCode.FORBIDDEN);
    expect(
      codeOf(() =>
        assertCanGrant(
          principal,
          target({
            roleKey: 'SUPER_ADMIN',
            scopeType: 'GLOBAL',
            schoolId: null,
            branchId: null,
          }),
        ),
      ),
    ).toBe(ErrorCode.FORBIDDEN);
  });

  it('blocks principals outside their branches', () => {
    expect(
      codeOf(() => assertCanGrant(principal, target({ branchId: 'other' }))),
    ).toBe(ErrorCode.FORBIDDEN_SCOPE);
    expect(
      codeOf(() =>
        assertCanGrant(
          principal,
          target({ scopeType: 'SCHOOL', branchId: null }),
        ),
      ),
    ).toBe(ErrorCode.FORBIDDEN);
  });

  it('blocks editing your own assignments, even for Super Admin', () => {
    expect(
      codeOf(() => assertCanGrant(admin, target({ targetUserId: 'admin' }))),
    ).toBe(ErrorCode.FORBIDDEN);
  });

  it('lets Super Admin grant PRINCIPAL anywhere', () => {
    expect(
      codeOf(() =>
        assertCanGrant(
          admin,
          target({ roleKey: 'PRINCIPAL', branchId: 'x', schoolId: 'y' }),
        ),
      ),
    ).toBe('ok');
  });

  it('ties SUPER_ADMIN to GLOBAL scope', () => {
    expect(
      codeOf(() => assertCanGrant(admin, target({ roleKey: 'SUPER_ADMIN' }))),
    ).toBe(ErrorCode.VALIDATION_FAILED);
    expect(
      codeOf(() => assertCanGrant(admin, target({ scopeType: 'GLOBAL' }))),
    ).toBe(ErrorCode.VALIDATION_FAILED);
  });

  it('keeps custom roles inside their school', () => {
    expect(
      codeOf(() =>
        assertCanGrant(
          admin,
          target({ roleKey: 'CUSTOM_X', roleSchoolId: 'other-school' }),
        ),
      ),
    ).toBe(ErrorCode.VALIDATION_FAILED);
  });
});
