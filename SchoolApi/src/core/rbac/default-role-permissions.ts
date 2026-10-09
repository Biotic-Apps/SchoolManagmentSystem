import { grant, viewOnly } from './grant';
import {
  PERMISSION_CATALOGUE,
  type PermissionKey,
} from './permission-catalogue';
import { RoleKey } from './role-key.enum';

// security.md §2.1. Permissions outside a role's navigation menu are used
// inside other screens (navigation.md menu rule).
const OWN_PROFILE = grant('profile', 'view', 'edit');

const PRINCIPAL: PermissionKey[] = [
  ...viewOnly('dashboard', 'schools'),
  ...grant('branches', 'view', 'edit'),
  ...grant('users', 'view', 'add', 'edit'),
  ...viewOnly('roles'),
  ...grant('sessions', 'view', 'add', 'edit'),
  ...grant('classes', 'view', 'add', 'edit', 'delete'),
  ...grant('students', 'view', 'add', 'edit', 'export', 'delete'),
  ...grant('admissions', 'view', 'add', 'edit', 'approve'),
  ...grant('guardians', 'view', 'add', 'edit', 'approve'),
  ...grant('staff', 'view', 'add', 'edit', 'approve', 'delete'),
  ...grant('timetable', 'view', 'add', 'edit', 'approve', 'publish'),
  // Principals can do any teacher task (proxy) for schools where teachers don't carry phones.
  ...grant('attendance', 'view', 'add', 'edit', 'submit', 'approve', 'export'),
  ...grant('diary', 'view', 'add', 'edit', 'submit', 'approve', 'publish'),
  ...grant('progress', 'view', 'edit'),
  ...grant('activities', 'view', 'add', 'edit', 'approve', 'publish'),
  ...grant('notices', 'view', 'add', 'edit', 'publish'),
  ...grant(
    'exams',
    'view',
    'add',
    'edit',
    'submit',
    'approve',
    'publish',
    'export',
  ),
  ...grant('fees', 'view', 'approve', 'export'),
  // Owner decision 2026-10-09: principal and coordinator manage payroll for their branch.
  ...grant('payroll', 'view', 'add', 'edit', 'submit', 'approve', 'export'),
  ...grant('expenses', 'view', 'approve'),
  ...grant('inventory', 'view', 'approve'),
  ...grant('health', 'view', 'add', 'edit'),
  ...grant('pickup', 'view', 'add', 'edit', 'approve'),
  ...grant('messages', 'view', 'add'),
  ...grant('meetings', 'view', 'add', 'edit'),
  ...grant('complaints', 'view', 'edit'),
  ...grant('certificates', 'view', 'add', 'approve'),
  ...grant('approvals', 'view', 'approve'),
  ...grant('reports', 'view', 'export'),
  // Phase 5: read-only own-school settings (not backups/support) + branch imports.
  ...viewOnly('settings'),
  'settings.import',
  ...OWN_PROFILE,
  'teacherwork.proxy',
  'audit.view',
  'people.sensitive.view',
  'fees.concession.approve',
  'self.payroll.view',
];

const SUPERVISOR: PermissionKey[] = [
  ...viewOnly('dashboard', 'sessions', 'classes', 'students', 'guardians'),
  ...viewOnly('staff'),
  // academics-timetable-contract D9: build drafts, allocate teachers, add rooms; publishing stays with the principal.
  ...grant('timetable', 'view', 'add', 'edit'),
  ...grant('attendance', 'view', 'add', 'edit', 'submit', 'approve'),
  ...grant('diary', 'view', 'add', 'edit', 'submit', 'approve', 'publish'),
  ...grant('activities', 'view', 'add', 'edit', 'submit'),
  ...grant('exams', 'view', 'add', 'edit', 'submit', 'approve'),
  ...grant('progress', 'view', 'edit'),
  ...viewOnly('health', 'certificates'),
  ...grant('pickup', 'view', 'add'),
  ...grant('notices', 'view', 'add'),
  ...grant('messages', 'view', 'add'),
  ...grant('meetings', 'view', 'add', 'edit'),
  ...grant('complaints', 'view', 'add', 'edit'),
  ...grant('approvals', 'view', 'approve'),
  ...OWN_PROFILE,
  'self.payroll.view',
  'teacherwork.proxy',
];

// Coordinator = supervisor + branch payroll management (owner decision 2026-10-09).
// School pay rules stay with the principal/admin (payroll-settings.service.ts).
const COORDINATOR: PermissionKey[] = [
  ...SUPERVISOR,
  ...grant('payroll', 'view', 'add', 'edit', 'submit', 'approve', 'export'),
];

const TEACHER: PermissionKey[] = [
  ...viewOnly('dashboard', 'sessions', 'classes', 'students', 'guardians'),
  ...viewOnly('health'),
  // User decision 2026-10-08: drafts of their class-teacher sections only (scope-checked); no publish.
  ...grant('timetable', 'view', 'add', 'edit'),
  ...grant('progress', 'view', 'edit'),
  ...grant('attendance', 'view', 'add', 'edit', 'submit'),
  ...grant('diary', 'view', 'add', 'edit', 'submit', 'publish'),
  ...grant('activities', 'view', 'add', 'edit', 'submit'),
  ...grant('exams', 'view', 'add', 'edit', 'submit'),
  ...grant('notices', 'view', 'add'),
  ...viewOnly('pickup'),
  ...grant('messages', 'view', 'add'),
  ...grant('meetings', 'view', 'add'),
  ...grant('complaints', 'view', 'add'),
  ...OWN_PROFILE,
  'self.payroll.view',
];

const HELPER: PermissionKey[] = [
  ...viewOnly('dashboard', 'sessions', 'classes', 'students', 'health'),
  ...grant('attendance', 'view', 'add', 'edit'),
  ...grant('diary', 'view', 'add', 'edit'),
  ...grant('activities', 'view', 'add', 'edit'),
  ...grant('complaints', 'view', 'add'),
  ...OWN_PROFILE,
  'self.payroll.view',
];

const ACCOUNTANT: PermissionKey[] = [
  ...viewOnly(
    'dashboard',
    'branches',
    'sessions',
    'classes',
    'students',
    'staff',
  ),
  // Accountant prepares, records and verifies (security.md §2.1).
  ...grant('fees', 'view', 'add', 'edit', 'submit', 'approve', 'export'),
  ...grant('payroll', 'view', 'add', 'edit', 'submit', 'export'),
  ...grant('expenses', 'view', 'add', 'edit', 'submit', 'export'),
  ...grant('inventory', 'view', 'add', 'edit', 'submit'),
  ...viewOnly('certificates'),
  ...grant('complaints', 'view', 'add'),
  ...grant('reports', 'view', 'export'),
  ...OWN_PROFILE,
  'self.payroll.view',
];

const PARENT: PermissionKey[] = [
  ...viewOnly('dashboard', 'students', 'diary', 'attendance', 'progress'),
  ...viewOnly('timetable', 'activities', 'notices', 'exams'),
  ...grant('fees', 'view', 'add'),
  ...grant('certificates', 'view', 'add'),
  ...grant('guardians', 'add'),
  ...grant('health', 'view', 'submit'),
  ...grant('pickup', 'view', 'add'),
  ...grant('messages', 'view', 'add'),
  ...grant('meetings', 'view', 'add'),
  ...grant('complaints', 'view', 'add'),
  ...OWN_PROFILE,
];

export const DEFAULT_ROLE_PERMISSIONS: Readonly<
  Record<RoleKey, readonly PermissionKey[]>
> = {
  [RoleKey.SUPER_ADMIN]: PERMISSION_CATALOGUE,
  [RoleKey.PRINCIPAL]: PRINCIPAL,
  [RoleKey.COORDINATOR]: COORDINATOR,
  [RoleKey.HEAD_TEACHER]: SUPERVISOR,
  [RoleKey.TEACHER]: TEACHER,
  [RoleKey.HELPER]: HELPER,
  [RoleKey.ACCOUNTANT]: ACCOUNTANT,
  [RoleKey.PARENT]: PARENT,
};

export const SYSTEM_ROLE_NAMES: Readonly<Record<RoleKey, string>> = {
  [RoleKey.SUPER_ADMIN]: 'Super Admin',
  [RoleKey.PRINCIPAL]: 'Principal',
  [RoleKey.COORDINATOR]: 'Coordinator',
  [RoleKey.HEAD_TEACHER]: 'Head Teacher',
  [RoleKey.TEACHER]: 'Teacher',
  [RoleKey.HELPER]: 'Helper',
  [RoleKey.ACCOUNTANT]: 'Accountant',
  [RoleKey.PARENT]: 'Parent',
};
