import type { PermissionKey } from '../../core/rbac/permission-catalogue';
import { RoleKey } from '../../core/rbac/role-key.enum';

export const REPORT_FORMATS = ['PDF', 'XLSX', 'CSV'] as const;
export type ReportFormatName = (typeof REPORT_FORMATS)[number];

export type ParamType = 'uuid' | 'month' | 'date' | 'int';

/** What a uuid param refers to, so clients can render the matching picker. */
export const PARAM_PICKERS = ['school', 'branch', 'exam'] as const;
export type ParamPicker = (typeof PARAM_PICKERS)[number];

export interface ReportParam {
  name: string;
  type: ParamType;
  required: boolean;
  /** Human label for the form field. */
  label: string;
  picker?: ParamPicker;
}

export interface ReportDefinition {
  key: string;
  title: string;
  description: string;
  /** Needed to see and run it. */
  permission: PermissionKey;
  superAdminOnly?: boolean;
  params: ReportParam[];
}

const p = (
  name: string,
  type: ParamType,
  label: string,
  required = true,
  picker?: ParamPicker,
): ReportParam => ({
  name,
  type,
  required,
  label,
  ...(picker ? { picker } : {}),
});
const BRANCH = p('branchId', 'uuid', 'Branch', true, 'branch');
const MONTH = p('month', 'month', 'Month');
const RANGE = [p('from', 'date', 'From'), p('to', 'date', 'To')];

export const REPORTS: readonly ReportDefinition[] = [
  {
    key: 'attendance.monthly',
    title: 'Monthly student attendance',
    description: 'Present/absent/late/leave and percent per student.',
    permission: 'attendance.view',
    params: [BRANCH, MONTH],
  },
  {
    key: 'attendance.staff',
    title: 'Monthly staff attendance',
    description: 'Attendance per staff member for a month.',
    permission: 'attendance.view',
    params: [BRANCH, MONTH],
  },
  {
    key: 'results.analysis',
    title: 'Results analysis',
    description: 'Average, pass rate and top scorer per section and subject.',
    permission: 'exams.view',
    params: [p('examId', 'uuid', 'Exam', true, 'exam')],
  },
  {
    key: 'fees.collection',
    title: 'Fee collection',
    description: 'Payments per day, method and cashier.',
    permission: 'fees.view',
    params: [BRANCH, ...RANGE],
  },
  {
    key: 'fees.aging',
    title: 'Fee aging',
    description: 'Outstanding balance per student by days overdue.',
    permission: 'fees.view',
    params: [BRANCH],
  },
  {
    key: 'fees.defaulters',
    title: 'Fee defaulters',
    description: 'Students with overdue balances.',
    permission: 'fees.view',
    params: [BRANCH, p('minDays', 'int', 'Overdue for at least (days)', false)],
  },
  {
    key: 'payroll.summary',
    title: 'Payroll summary',
    description: 'Net, paid and balance per staff member for a month.',
    permission: 'payroll.view',
    params: [BRANCH, MONTH],
  },
  {
    key: 'expenses.summary',
    title: 'Expenses summary',
    description: 'Expenses per category and vendor.',
    permission: 'expenses.view',
    params: [BRANCH, ...RANGE],
  },
  {
    key: 'profit-loss',
    title: 'Profit & Loss',
    description: 'Income vs expenses and payroll for a date range.',
    permission: 'expenses.view',
    params: [BRANCH, ...RANGE],
  },
  {
    key: 'inventory.stock',
    title: 'Inventory stock',
    description: 'Stock on hand against reorder levels.',
    permission: 'inventory.view',
    params: [BRANCH],
  },
  {
    key: 'branch.comparison',
    title: 'Branch comparison',
    description:
      'Students, attendance, billing, collection and expenses per branch.',
    permission: 'reports.view',
    superAdminOnly: true,
    params: [p('schoolId', 'uuid', 'School', true, 'school'), MONTH],
  },
];

export interface CatalogViewer {
  activeRole: string;
  permissions: ReadonlySet<string>;
  /** Reports cover whole branches: only management scopes may run them. */
  managesBranches: boolean;
}

export function canRunReport(
  viewer: CatalogViewer,
  report: ReportDefinition,
): boolean {
  if (!viewer.managesBranches) return false;
  if (report.superAdminOnly) {
    return viewer.activeRole === (RoleKey.SUPER_ADMIN as string);
  }
  return viewer.permissions.has(report.permission);
}

export const catalogFor = (viewer: CatalogViewer): ReportDefinition[] =>
  REPORTS.filter((report) => canRunReport(viewer, report));

export const findReport = (key: string): ReportDefinition | undefined =>
  REPORTS.find((report) => report.key === key);
