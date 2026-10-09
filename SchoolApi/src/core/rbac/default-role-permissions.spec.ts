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
  [RoleKey.COORDINATOR]: [...SUPERVISOR_MENU, 'payroll'],
  [RoleKey.HEAD_TEACHER]: SUPERVISOR_MENU,
  [RoleKey.TEACHER]: [
    'dashboard',
    'classes',
    'timetable',
    'attendance',
    'diary',
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

  it('payroll: principal and coordinator manage, head teacher only own salary', () => {
    const manage = ['view', 'add', 'edit', 'submit', 'approve', 'export'].map(
      (a) => `payroll.${a}`,
    );
    for (const role of [RoleKey.PRINCIPAL, RoleKey.COORDINATOR]) {
      const held = [...permissionsOf(role)];
      expect(held.filter((p) => p.startsWith('payroll.')).sort()).toEqual(
        [...manage].sort(),
      );
    }
    const head = [...permissionsOf(RoleKey.HEAD_TEACHER)];
    expect(head.filter((p) => p.startsWith('payroll.'))).toEqual([]);
    expect(head).toContain('self.payroll.view');
    // Coordinator gains payroll only; every other module matches the head teacher.
    const coordinatorOther = [...permissionsOf(RoleKey.COORDINATOR)].filter(
      (p) => !p.startsWith('payroll.'),
    );
    expect(coordinatorOther.sort()).toEqual([...head].sort());
    expect(permissionsOf(RoleKey.ACCOUNTANT).has('payroll.approve')).toBe(
      false,
    );
  });

  it('timetable: supervisors and teachers build, only principals publish', () => {
    for (const role of [RoleKey.COORDINATOR, RoleKey.HEAD_TEACHER]) {
      const held = permissionsOf(role);
      expect(held.has('timetable.edit')).toBe(true);
      expect(held.has('timetable.add')).toBe(true);
      expect(held.has('timetable.publish')).toBe(false);
    }
    expect(permissionsOf(RoleKey.PRINCIPAL).has('timetable.publish')).toBe(
      true,
    );
    // Teachers edit drafts of their class-teacher sections only (scope-checked), never publish.
    const teacher = [...permissionsOf(RoleKey.TEACHER)];
    expect(teacher.filter((p) => p.startsWith('timetable.')).sort()).toEqual([
      'timetable.add',
      'timetable.edit',
      'timetable.view',
    ]);
  });
});
