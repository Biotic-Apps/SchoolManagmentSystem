import { STAFF_ROLE_KEYS } from '../dto/staff-input.dto';

/** Role of a staff login: the explicit choice, else the designation's role, else TEACHER. */
export function staffRoleFor(designation: string, roleKey?: string): string {
  return (
    roleKey ??
    (STAFF_ROLE_KEYS as readonly string[]).find((k) => k === designation) ??
    'TEACHER'
  );
}
