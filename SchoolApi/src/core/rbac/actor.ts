import type { AuthUser } from '../common/types/auth-user';
import { RoleKey } from './role-key.enum';

export const isSuperAdmin = (user: AuthUser): boolean =>
  user.activeRole === String(RoleKey.SUPER_ADMIN);

export const isPrincipal = (user: AuthUser): boolean =>
  user.activeRole === String(RoleKey.PRINCIPAL);
