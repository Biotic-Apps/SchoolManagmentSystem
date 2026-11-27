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

  it('labels every param and names the picker of every uuid param', () => {
    for (const report of REPORTS) {
      for (const param of report.params) {
        expect(param.label.trim()).not.toBe('');
        if (param.type === 'uuid') expect(param.picker).toBeDefined();
      }
    }
    expect(findReport('fees.aging')?.params[0]).toEqual({
      name: 'branchId',
      type: 'uuid',
      required: true,
      label: 'Branch',
      picker: 'branch',
    });
    expect(findReport('branch.comparison')?.params[0].picker).toBe('school');
    expect(findReport('results.analysis')?.params[0].picker).toBe('exam');
  });
});
