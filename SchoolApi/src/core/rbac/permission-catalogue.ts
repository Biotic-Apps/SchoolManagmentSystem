export const PERMISSION_MODULES = [
  'dashboard',
  'schools',
  'branches',
  'users',
  'roles',
  'sessions',
  'classes',
  'admissions',
  'students',
  'guardians',
  'staff',
  'timetable',
  'diary',
  'activities',
  'notices',
  'attendance',
  'exams',
  'homework',
  'progress',
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
] as const;

export const PERMISSION_ACTIONS = [
  'view',
  'add',
  'edit',
  'submit',
  'approve',
  'publish',
  'export',
  'delete',
] as const;

export const SPECIAL_PERMISSIONS = [
  'self.payroll.view',
  'teacherwork.proxy',
  'people.sensitive.view',
  'audit.view',
  'fees.concession.approve',
  // Phase 5 §E: data import for managed branches (principal) without full settings.edit.
  'settings.import',
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
export type SpecialPermission = (typeof SPECIAL_PERMISSIONS)[number];
export type ModulePermission = `${PermissionModule}.${PermissionAction}`;
export type PermissionKey = ModulePermission | SpecialPermission;

export const MODULE_PERMISSIONS: readonly ModulePermission[] =
  PERMISSION_MODULES.flatMap((module) =>
    PERMISSION_ACTIONS.map((action): ModulePermission => `${module}.${action}`),
  );

export const PERMISSION_CATALOGUE: readonly PermissionKey[] = [
  ...MODULE_PERMISSIONS,
  ...SPECIAL_PERMISSIONS,
];
