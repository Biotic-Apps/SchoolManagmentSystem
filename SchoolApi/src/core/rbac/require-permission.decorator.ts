import { SetMetadata } from '@nestjs/common';
import type { PermissionKey } from './permission-catalogue';

export const REQUIRED_PERMISSIONS_KEY = 'requiredPermissions';

/** Passes when the active role context holds any one of the given permissions. */
export const RequirePermission = (...permissions: PermissionKey[]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
