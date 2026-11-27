import type { AuthUser } from '../../core/common/types/auth-user';
import type { PrismaService } from '../../core/prisma/prisma.service';
import { Scope } from '../../core/rbac/scope/scope';
import { NoticeTargetService } from './notice-target.service';

const SCHOOL = '0193a000-0000-7000-8000-000000000001';

function setup() {
  const prisma = { staff: { findUnique: jest.fn().mockResolvedValue(null) } };
  return new NoticeTargetService(prisma as unknown as PrismaService);
}

describe('NoticeTargetService school-wide notices', () => {
  const superAdmin = { id: 'sa', assignments: [] } as unknown as AuthUser;

  it('lets a super admin address the whole school they name', async () => {
    const origin = await setup().validate(superAdmin, Scope.createGlobal(), {
      schoolWide: true,
      schoolId: SCHOOL,
    });
    expect(origin).toMatchObject({ schoolId: SCHOOL, branchId: null });
    expect(origin.audience.schoolWide).toBe(true);
  });

  it('still refuses when no school can be determined', async () => {
    await expect(
      setup().validate(superAdmin, Scope.createGlobal(), { schoolWide: true }),
    ).rejects.toThrow('Cannot determine the school of the notice');
  });

  it('refuses a school outside the author scope', async () => {
    const principal = Scope.createLimited({
      schoolIds: [],
      branchIds: ['b'],
      sectionIds: [],
      memberSchoolIds: ['other'],
      memberBranchIds: ['b'],
    });
    await expect(
      setup().validate(superAdmin, principal, {
        schoolWide: true,
        schoolId: SCHOOL,
      }),
    ).rejects.toThrow();
  });
});
