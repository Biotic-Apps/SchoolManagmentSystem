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
  ...grant('attendance', 'view', 'approve', 'export'),
  ...grant('diary', 'view', 'approve', 'publish'),
  ...grant('syllabus', 'view', 'approve'),
  ...grant('activities', 'view', 'add', 'edit', 'approve', 'publish'),
  ...grant('notices', 'view', 'add', 'edit', 'publish'),
  ...grant('exams', 'view', 'add', 'edit', 'approve', 'publish', 'export'),
  ...grant('fees', 'view', 'approve', 'export'),
  ...grant('payroll', 'view', 'approve'),
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
  ...OWN_PROFILE,
  'teacherwork.proxy',
  'audit.view',
  'people.sensitive.view',
  'fees.concession.approve',
];

const SUPERVISOR: PermissionKey[] = [
  ...viewOnly('dashboard', 'sessions', 'classes', 'students', 'guardians'),
  ...viewOnly('staff', 'timetable'),
  ...grant('attendance', 'view', 'add', 'edit', 'submit', 'approve'),
  ...grant('diary', 'view', 'add', 'edit', 'submit', 'approve', 'publish'),
  ...grant('syllabus', 'view', 'add', 'edit', 'submit', 'approve'),
  ...grant('activities', 'view', 'add', 'edit', 'submit'),
  ...grant('exams', 'view', 'add', 'edit', 'submit', 'approve'),
  ...viewOnly('progress', 'health'),
  ...grant('pickup', 'view', 'add'),
  ...grant('messages', 'view', 'add'),
  ...grant('meetings', 'view', 'add', 'edit'),
  ...grant('complaints', 'view', 'add', 'edit'),
  ...grant('approvals', 'view', 'approve'),
  ...OWN_PROFILE,
  'self.payroll.view',
  'teacherwork.proxy',
];

const TEACHER: PermissionKey[] = [
  ...viewOnly('dashboard', 'sessions', 'classes', 'students', 'guardians'),
  ...viewOnly('timetable', 'progress', 'health'),
  ...grant('attendance', 'view', 'add', 'edit', 'submit'),
  ...grant('diary', 'view', 'add', 'edit', 'submit', 'publish'),
  ...grant('syllabus', 'view', 'add', 'edit', 'submit'),
  ...grant('activities', 'view', 'add', 'edit', 'submit'),
  ...grant('exams', 'view', 'add', 'edit', 'submit'),
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
  ...viewOnly('dashboard', 'sessions', 'classes', 'students'),
  ...grant('fees', 'view', 'add', 'edit', 'submit', 'export'),
  ...grant('payroll', 'view', 'add', 'edit', 'submit', 'export'),
  ...grant('expenses', 'view', 'add', 'edit', 'submit', 'export'),
  ...grant('inventory', 'view', 'add', 'edit', 'submit'),
  ...grant('complaints', 'view', 'add'),
  ...grant('reports', 'view', 'export'),
  ...OWN_PROFILE,
  'self.payroll.view',
];

const PARENT: PermissionKey[] = [
  ...viewOnly('dashboard', 'students', 'diary', 'attendance', 'progress'),
  ...viewOnly('syllabus', 'timetable', 'activities', 'notices', 'exams'),
  ...grant('fees', 'view', 'add'),
  ...grant('guardians', 'add'),
  ...grant('health', 'view', 'submit'),
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
  [RoleKey.COORDINATOR]: SUPERVISOR,
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
