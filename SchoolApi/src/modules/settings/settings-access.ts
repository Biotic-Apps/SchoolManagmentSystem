import { forbidden, notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RoleKey } from '../../core/rbac/role-key.enum';
import type { Scope } from '../../core/rbac/scope/scope';
import type { SettingsRepository, SettingsSchool } from './settings.repository';

/**
 * Reads need `settings.view` (route guard) and membership of the school
 * (principals: their own school only; super admin: every school).
 */
export async function readableSchool(
  repository: SettingsRepository,
  scope: Scope,
  schoolId: string,
): Promise<SettingsSchool> {
  const school = await repository.school(schoolId);
  if (!school) throw notFound('School');
  scope.assertReadSchool(schoolId);
  return school;
}

/** Writes need `settings.edit` (route guard) and the SUPER_ADMIN active role. */
export function assertSuperAdmin(user: AuthUser): void {
  if (user.activeRole !== (RoleKey.SUPER_ADMIN as string)) {
    throw forbidden('Only a super admin can change school settings');
  }
}

export async function editableSchool(
  repository: SettingsRepository,
  user: AuthUser,
  scope: Scope,
  schoolId: string,
): Promise<SettingsSchool> {
  assertSuperAdmin(user);
  const school = await repository.school(schoolId);
  if (!school) throw notFound('School');
  scope.assertManageSchool(schoolId);
  return school;
}
