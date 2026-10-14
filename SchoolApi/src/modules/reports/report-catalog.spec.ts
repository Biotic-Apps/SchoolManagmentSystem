import { catalogFor, findReport, REPORTS } from './report-catalog';

const viewer = (
  activeRole: string,
  permissions: string[],
  managesBranches = true,
) => ({ activeRole, permissions: new Set(permissions), managesBranches });

const keys = (v: ReturnType<typeof viewer>) => catalogFor(v).map((r) => r.key);

describe('report catalog', () => {
  it('shows an accountant only the reports of their permissions', () => {
    expect(
      keys(
        viewer('ACCOUNTANT', ['fees.view', 'reports.view', 'expenses.view']),
      ),
    ).toEqual([
      'fees.collection',
      'fees.aging',
      'fees.defaulters',
      'expenses.summary',
      'profit-loss',
    ]);
  });

  it('keeps branch comparison for super admins only', () => {
    const all = REPORTS.map((r) => r.permission);
    expect(keys(viewer('PRINCIPAL', all))).not.toContain('branch.comparison');
    expect(keys(viewer('SUPER_ADMIN', all))).toContain('branch.comparison');
    expect(keys(viewer('SUPER_ADMIN', all))).toHaveLength(REPORTS.length);
  });

  it('hides everything from scopes without branch management', () => {
    expect(keys(viewer('TEACHER', ['attendance.view'], false))).toEqual([]);
    expect(keys(viewer('PARENT', ['fees.view'], false))).toEqual([]);
  });

  it('finds definitions by key', () => {
    expect(findReport('fees.aging')?.permission).toBe('fees.view');
    expect(findReport('nope')).toBeUndefined();
  });
});
