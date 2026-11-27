import type { PrismaService } from '../../../core/prisma/prisma.service';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { Scope } from '../../../core/rbac/scope/scope';
import {
  assertManageTemplate,
  cleanHeader,
  ReportCardTemplatesService,
} from './report-card-templates.service';

const SCHOOL = 'school-1';
const BRANCH = 'branch-1';

const principal = Scope.createLimited({
  schoolIds: [],
  branchIds: [BRANCH],
  sectionIds: [],
  memberSchoolIds: [SCHOOL],
  memberBranchIds: [BRANCH],
});
const schoolAdmin = Scope.createLimited({
  schoolIds: [SCHOOL],
  branchIds: [],
  sectionIds: [],
  memberSchoolIds: [SCHOOL],
  memberBranchIds: [],
});

function service() {
  const created: Record<string, unknown>[] = [];
  const now = new Date();
  const tx = {
    reportCardTemplate: {
      updateMany: jest.fn(),
      create: jest.fn(({ data }: { data: Record<string, unknown> }) => {
        created.push(data);
        return Promise.resolve({
          id: 't1',
          isDefault: false,
          layout: {},
          header: {},
          showGradingScale: true,
          showSkills: true,
          showRemarks: true,
          showAttendance: false,
          showPosition: true,
          signatures: [],
          remarkLabels: null,
          footerText: null,
          createdAt: now,
          updatedAt: now,
          ...data,
        });
      }),
    },
  };
  const prisma = {
    branch: {
      findUnique: jest.fn(({ where }: { where: { id: string } }) =>
        Promise.resolve(
          where.id === BRANCH ? { id: BRANCH, schoolId: SCHOOL } : null,
        ),
      ),
    },
    $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
  } as unknown as PrismaService;
  return { svc: new ReportCardTemplatesService(prisma), created };
}

const user = { id: 'u1' } as AuthUser;

describe('ReportCardTemplatesService.create scope', () => {
  it('stores a branch manager template on their branch, not school level', async () => {
    const { svc, created } = service();
    const dto = await svc.create(user, principal, { name: 'Landscape' });
    expect(dto.branchId).toBe(BRANCH);
    expect(created[0]).toMatchObject({ schoolId: SCHOOL, branchId: BRANCH });
    // ...and the creator can still edit it afterwards.
    expect(() =>
      assertManageTemplate(principal, { schoolId: SCHOOL, branchId: BRANCH }),
    ).not.toThrow();
  });

  it('keeps school-level templates for school managers', async () => {
    const { svc, created } = service();
    await svc.create(user, schoolAdmin, { name: 'School' });
    expect(created[0]).toMatchObject({ schoolId: SCHOOL, branchId: null });
  });

  it('refuses a branch the user cannot manage', async () => {
    const { svc } = service();
    await expect(
      svc.create(user, principal, { name: 'X', branchId: 'other' }),
    ).rejects.toThrow();
  });

  it('school-level templates need school management', () => {
    expect(() =>
      assertManageTemplate(principal, { schoolId: SCHOOL, branchId: null }),
    ).toThrow();
    expect(() =>
      assertManageTemplate(schoolAdmin, { schoolId: SCHOOL, branchId: null }),
    ).not.toThrow();
  });

  it('drops blank header overrides and footer on save', async () => {
    const { svc, created } = service();
    await svc.create(user, principal, {
      name: 'T',
      header: { showLogo: true, schoolName: '   ', subtitle: ' Term 1 ' },
      footerText: '  ',
    });
    expect(created[0].header).toEqual({ showLogo: true, subtitle: 'Term 1' });
    expect(created[0].footerText).toBeNull();
  });
});

describe('cleanHeader', () => {
  it('keeps booleans and filled text only', () => {
    expect(
      cleanHeader({ showLogo: false, schoolName: '', phone: '123' }),
    ).toEqual({ showLogo: false, phone: '123' });
  });
});
