import type { PermissionKey } from './permission-catalogue';

const ACTION_LABELS: Record<string, string> = {
  view: 'View',
  add: 'Add',
  edit: 'Edit',
  submit: 'Submit',
  approve: 'Approve',
  publish: 'Publish',
  export: 'Export',
  delete: 'Archive',
};

const SPECIAL: Record<string, string> = {
  'self.payroll.view': 'View own attendance, leave and salary',
  'teacherwork.proxy': 'Act on behalf of a teacher (supervisor proxy)',
  'people.sensitive.view': 'View unmasked ID numbers',
  'audit.view': 'View audit log',
  'fees.concession.approve': 'Approve fee concessions',
};

export interface PermissionInfo {
  key: PermissionKey;
  module: string;
  action: string;
  description: string;
}

export function describePermission(key: PermissionKey): PermissionInfo {
  const parts = key.split('.');
  const action = parts[parts.length - 1];
  const module = parts.slice(0, -1).join('.');
  const description =
    SPECIAL[key] ?? `${ACTION_LABELS[action] ?? action} ${module}`;
  return { key, module, action, description };
}
