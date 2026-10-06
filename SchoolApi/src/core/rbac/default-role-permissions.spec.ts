import { DEFAULT_ROLE_PERMISSIONS } from './default-role-permissions';
import {
  PERMISSION_CATALOGUE,
  type PermissionKey,
} from './permission-catalogue';
import { RoleKey } from './role-key.enum';

// Menu ids whose permission is not `<id>.view`.
const MENU_PERMISSION: Record<string, PermissionKey> = {
  my_salary: 'self.payroll.view',
};

const SUPERVISOR_MENU = [
  'dashboard',
  'classes',
  'students',
  'staff',
  'timetable',
  'attendance',
  'diary',
  'syllabus',
  'activities',
  'exams',
  'progress',
  'health',
  'pickup',
  'messages',
  'meetings',
  'complaints',
  'approvals',
  'my_salary',
  'profile',
];

// Default menus from docs/navigation.md.
const DEFAULT_MENUS: Record<RoleKey, string[]> = {
  [RoleKey.SUPER_ADMIN]: [
    'dashboard',
    'schools',
    'branches',
    'users',
    'roles',
    'sessions',
    'classes',
    'students',
    'admissions',
    'guardians',
    'staff',
    'timetable',
    'syllabus',
    'diary',
    'activities',
    'notices',
    'attendance',
    'exams',
    'fees',
    'payroll',
    'expenses',
    'inventory',
    'health',
    'pickup',
    'complaints',
    'certificates',
    'approvals',
    'reports',
    'settings',
    'profile',
  ],
  [RoleKey.PRINCIPAL]: [
    'dashboard',
    'branches',
    'classes',
    'students',
    'admissions',
    'guardians',
    'staff',
    'timetable',
    'attendance',
    'diary',
    'syllabus',
    'activities',
    'notices',
    'exams',
    'fees',
    'payroll',
    'expenses',
    'inventory',
    'health',
    'pickup',
    'messages',
    'meetings',
    'complaints',
    'certificates',
    'approvals',
    'reports',
    'settings',
    'profile',
  ],
  [RoleKey.COORDINATOR]: SUPERVISOR_MENU,
  [RoleKey.HEAD_TEACHER]: SUPERVISOR_MENU,
  [RoleKey.TEACHER]: [
    'dashboard',
    'classes',
    'timetable',
    'attendance',
    'diary',
    'syllabus',
    'activities',
    'exams',
    'progress',
    'messages',
    'meetings',
    'complaints',
    'my_salary',
    'profile',
  ],
  [RoleKey.HELPER]: [
    'dashboard',
    'classes',
    'attendance',
    'diary',
    'activities',
    'complaints',
    'my_salary',
    'profile',
  ],
  [RoleKey.ACCOUNTANT]: [
    'dashboard',
    'students',
    'fees',
    'payroll',
    'expenses',
    'inventory',
    'complaints',
    'reports',
    'my_salary',
    'profile',
  ],
  [RoleKey.PARENT]: [
    'dashboard',
    'students',
    'diary',
    'attendance',
    'progress',
    'syllabus',
    'timetable',
    'fees',
    'messages',
    'meetings',
    'complaints',
    'profile',
  ],
};

const permissionsOf = (role: RoleKey) =>
  new Set<string>(DEFAULT_ROLE_PERMISSIONS[role]);

describe('DEFAULT_ROLE_PERMISSIONS', () => {
  it('only references catalogue permissions, without duplicates', () => {
    for (const permissions of Object.values(DEFAULT_ROLE_PERMISSIONS)) {
      expect(permissions.every((p) => PERMISSION_CATALOGUE.includes(p))).toBe(
        true,
      );
      expect(new Set(permissions).size).toBe(permissions.length);
    }
  });

  it.each(Object.entries(DEFAULT_MENUS))(
    '%s holds the view permission of every default menu entry',
    (role, menu) => {
      const held = permissionsOf(role as RoleKey);
      const missing = menu
        .map((id) => MENU_PERMISSION[id] ?? `${id}.view`)
        .filter((p) => !held.has(p));
      expect(missing).toEqual([]);
    },
  );

  it.each([RoleKey.TEACHER, RoleKey.COORDINATOR, RoleKey.HEAD_TEACHER])(
    '%s gets in-screen views granted by security.md §2.1',
    (role) => {
      const held = permissionsOf(role);
      for (const p of ['guardians.view', 'health.view', 'sessions.view'])
        expect(held.has(p)).toBe(true);
    },
  );

  it('helper: no fees, no payroll approval, no exam approval, no attendance submit', () => {
    const held = [...permissionsOf(RoleKey.HELPER)];
    expect(held.filter((p) => p.startsWith('fees.'))).toEqual([]);
    expect(held).not.toContain('payroll.approve');
    expect(held).not.toContain('exams.approve');
    expect(held).not.toContain('attendance.submit');
    expect(held.some((p) => p.endsWith('.approve'))).toBe(false);
  });

  it('parent: cannot edit attendance, exams or fees', () => {
    const held = permissionsOf(RoleKey.PARENT);
    for (const p of ['attendance.edit', 'exams.edit', 'fees.edit'])
      expect(held.has(p)).toBe(false);
    expect([...held].some((p) => p.endsWith('.approve'))).toBe(false);
  });

  it('teacher and helper: no payroll beyond their own', () => {
    for (const role of [RoleKey.TEACHER, RoleKey.HELPER]) {
      const held = [...permissionsOf(role)];
      expect(held.filter((p) => p.startsWith('payroll.'))).toEqual([]);
      expect(held).toContain('self.payroll.view');
    }
  });
});
