import { Scope } from '../../../core/rbac/scope/scope';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import type { ChallanSource } from './challan-source.service';
import { FamilyChallanService } from './family-challan.service';

const SCHOOL = 'school-1';
const BRANCH = 'branch-1';

const parentScope = (studentIds: string[]) =>
  Scope.createLimited({
    schoolIds: [],
    branchIds: [],
    sectionIds: [],
    memberSchoolIds: [SCHOOL],
    memberBranchIds: [BRANCH],
    studentIds,
    guardian: true,
  });

function setup(links: string[] = []) {
  const invoiceFind = jest.fn().mockResolvedValue([]);
  const prisma = {
    guardian: {
      findFirst: jest.fn().mockResolvedValue({ id: 'g-other', name: 'Other' }),
    },
    studentGuardian: {
      findMany: jest
        .fn()
        .mockResolvedValue(links.map((studentId) => ({ studentId }))),
    },
    invoice: { findMany: invoiceFind },
  } as unknown as PrismaService;
  const service = new FamilyChallanService(
    prisma,
    {} as unknown as ChallanSource,
  );
  return { service, invoiceFind };
}

describe('FamilyChallanService access', () => {
  it("a parent asking for another family's students gets 404 and nothing is read", async () => {
    const { service, invoiceFind } = setup();
    await expect(
      service.forStudents(parentScope(['mine']), ['someone-else'], BRANCH),
    ).rejects.toMatchObject({ status: 404 });
    expect(invoiceFind).not.toHaveBeenCalled();
  });

  it("a parent passing another guardian's id gets 404", async () => {
    const { service, invoiceFind } = setup(['someone-else']);
    await expect(
      service.forGuardian(parentScope(['mine']), 'g-other', BRANCH),
    ).rejects.toMatchObject({ status: 404 });
    expect(invoiceFind).not.toHaveBeenCalled();
  });

  it('a parent may print their own children', async () => {
    const { service, invoiceFind } = setup();
    // No open invoices -> 400 after the query: access was granted.
    await expect(
      service.forStudents(parentScope(['mine']), ['mine'], BRANCH),
    ).rejects.toMatchObject({ status: 400 });
    expect(invoiceFind).toHaveBeenCalledTimes(1);
  });

  it('staff queries are limited to their schools/branches', async () => {
    const { service, invoiceFind } = setup();
    const principal = Scope.createLimited({
      schoolIds: [SCHOOL],
      branchIds: [],
      sectionIds: [],
      memberSchoolIds: [SCHOOL],
      memberBranchIds: [],
    });
    await expect(
      service.forStudents(principal, ['s1'], BRANCH),
    ).rejects.toMatchObject({ status: 400 });
    const where = (invoiceFind.mock.calls[0] as [{ where: object }])[0].where;
    expect(where).toMatchObject({
      OR: [{ schoolId: { in: [SCHOOL] } }, { branchId: { in: [] } }],
    });
  });
});
