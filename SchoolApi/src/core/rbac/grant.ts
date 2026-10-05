import type {
  ModulePermission,
  PermissionAction,
  PermissionModule,
} from './permission-catalogue';

export function grant(
  module: PermissionModule,
  ...actions: PermissionAction[]
): ModulePermission[] {
  return actions.map((action): ModulePermission => `${module}.${action}`);
}

export function viewOnly(...modules: PermissionModule[]): ModulePermission[] {
  return modules.map((module): ModulePermission => `${module}.view`);
}
