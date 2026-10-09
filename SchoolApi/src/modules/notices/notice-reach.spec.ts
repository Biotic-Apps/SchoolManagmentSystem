import { Scope } from '../../core/rbac/scope/scope';
import { noticeListWhere, noticeReach } from './notice-reach';

const limited = (ids: Partial<Parameters<typeof Scope.createLimited>[0]>) =>
  Scope.createLimited({
    schoolIds: [],
    branchIds: [],
    sectionIds: [],
    memberSchoolIds: ['school'],
    memberBranchIds: ['branch'],
    ...ids,
  });

describe('noticeReach', () => {
  it('super admin: no filter at all (never an empty object inside OR)', () => {
    expect(noticeReach('admin', Scope.createGlobal())).toEqual({});
  });

  it('principal: every notice of the managed branch, any author/status', () => {
    const where = noticeReach('p', limited({ branchIds: ['branch'] }));
    expect(where.OR).toEqual([
      { status: 'PUBLISHED', recipients: { some: { userId: 'p' } } },
      { authorId: 'p' },
      { OR: [{ schoolId: { in: [] } }, { branchId: { in: ['branch'] } }] },
    ]);
  });

  it('teacher: only addressed notices and own notices', () => {
    const where = noticeReach(
      't',
      limited({ sectionIds: ['5a'], sectionLimited: true }),
    );
    expect(where.OR).toHaveLength(2);
  });

  it('parent: only addressed notices and own notices', () => {
    const where = noticeReach(
      'g',
      limited({ guardian: true, studentIds: ['s'] }),
    );
    expect(where.OR).toHaveLength(2);
  });
});

describe('noticeListWhere', () => {
  it('super admin without filters: only the status', () => {
    expect(noticeListWhere('admin', Scope.createGlobal(), {})).toEqual({
      status: undefined,
    });
  });

  it('branch view also shows school-level notices of that school', () => {
    const where = noticeListWhere('admin', Scope.createGlobal(), {
      branchId: 'branch',
      schoolId: 'school',
      status: 'PUBLISHED',
    });
    expect(where).toEqual({
      AND: [
        {
          OR: [{ branchId: 'branch' }, { branchId: null, schoolId: 'school' }],
        },
      ],
      status: 'PUBLISHED',
    });
  });

  it('keeps the reach for limited scopes', () => {
    const where = noticeListWhere('t', limited({ sectionLimited: true }), {
      branchId: 'branch',
    });
    expect(where.AND).toEqual([
      { OR: expect.any(Array) as unknown },
      { OR: [{ branchId: 'branch' }] },
    ]);
  });
});
