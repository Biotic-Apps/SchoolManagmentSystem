/**
 * A guardian's parent sign-in after admission / adding a guardian.
 * CREATED: new login with a one-time temporary password (shown once).
 * EXISTING: they already had a login and keep their own password.
 * SKIPPED: no login made (`reason` says why); staff can resolve it later.
 */
export class ParentLoginDto {
  guardianId!: string;
  guardianName!: string;
  status!: 'CREATED' | 'EXISTING' | 'SKIPPED';
  /** Sign-in ids: email, phone, or any linked child's admission number. */
  email!: string | null;
  phone!: string | null;
  temporaryPassword!: string | null;
  reason!: string | null;
}
