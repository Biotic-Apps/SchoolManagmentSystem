import type { CacheStore } from '../../cache/cache-store';
import type { AccessCache } from '../../rbac/access/access-cache';
import type { SchoolSettingsReader } from '../../school-settings/school-settings.reader';
import { schoolIdsOf, UserAuthPolicyService } from './user-auth-policy.service';

const cache = {
  getOrLoad: (_: string, __: number, load: () => Promise<unknown>) => load(),
  del: jest.fn(),
} as unknown as CacheStore;

function service(requiredBySchool: Record<string, string[]>, all: string[]) {
  const settings = {
    authPolicies: jest.fn((ids: string[] | null) =>
      Promise.resolve({
        twoFactorRequiredFor:
          ids === null ? all : ids.flatMap((id) => requiredBySchool[id] ?? []),
      }),
    ),
  };
  return new UserAuthPolicyService(
    { assignments: jest.fn() } as unknown as AccessCache,
    settings as unknown as SchoolSettingsReader,
    cache,
  );
}

const a = (roleKey: string, scopeType: string, schoolId: string | null) =>
  ({ roleKey, scopeType, schoolId }) as never;

describe('UserAuthPolicyService', () => {
  it('maps GLOBAL to every school and dedupes school ids', () => {
    expect(schoolIdsOf([a('X', 'GLOBAL', null), a('Y', 'BRANCH', 's1')])).toBe(
      null,
    );
    expect(
      schoolIdsOf([a('X', 'BRANCH', 's1'), a('Y', 'SCHOOL', 's1')]),
    ).toEqual(['s1']);
  });

  it('requires 2FA only for a role listed by that assignment’s school', async () => {
    const policies = service({ s1: ['ACCOUNTANT'], s2: [] }, ['ACCOUNTANT']);
    expect(
      await policies.twoFactorRequired('u', [a('ACCOUNTANT', 'BRANCH', 's1')]),
    ).toBe(true);
    expect(
      await policies.twoFactorRequired('u', [
        a('ACCOUNTANT', 'BRANCH', 's2'),
        a('TEACHER', 'BRANCH', 's1'),
      ]),
    ).toBe(false);
  });

  it('uses every school for GLOBAL assignments and skips school-less ones', async () => {
    const policies = service({}, ['SUPER_ADMIN']);
    expect(
      await policies.twoFactorRequired('u', [a('SUPER_ADMIN', 'GLOBAL', null)]),
    ).toBe(true);
    expect(
      await policies.twoFactorRequired('u', [a('PARENT', 'GUARDIAN', null)]),
    ).toBe(false);
  });
});
