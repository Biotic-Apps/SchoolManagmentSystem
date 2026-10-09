import type { ParentLoginDto } from '../dto/parent-login.dto';

/** Audit view of parent sign-ins: never the temporary password. */
export function auditedLogins(logins: ParentLoginDto[]) {
  return logins.map((l) => ({
    guardianId: l.guardianId,
    status: l.status,
    reason: l.reason,
  }));
}
