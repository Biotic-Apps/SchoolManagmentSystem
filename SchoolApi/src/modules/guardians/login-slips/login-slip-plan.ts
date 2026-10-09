/**
 * What printing a login slip does to a parent's sign-in:
 * CREATE  - no parent login yet: one is made with a temporary password;
 * RESET   - has a login but never signed in: a new temporary password;
 * KEEP    - already signs in (or also works as staff): slip shows the username only;
 * SKIP    - login disabled, or the child has no verified guardian: no slip.
 */
export type SlipAction = 'CREATE' | 'RESET' | 'KEEP' | 'SKIP';

export interface SlipGuardianState {
  guardianId: string;
  user: {
    status: string;
    lastLoginAt: Date | null;
    /** Active non-parent roles (staff logins are reset from Users). */
    staffRoles: number;
  } | null;
}

export function slipAction(guardian: SlipGuardianState | null): SlipAction {
  if (!guardian) return 'SKIP';
  const { user } = guardian;
  if (!user) return 'CREATE';
  if (user.status !== 'ACTIVE') return 'SKIP';
  if (user.staffRoles > 0 || user.lastLoginAt) return 'KEEP';
  return 'RESET';
}

export interface SlipPlanCounts {
  /** Students covered. */
  students: number;
  /** Slips that will print. */
  slips: number;
  create: number;
  reset: number;
  keep: number;
  skip: number;
}

/** Counts per action; a guardian of several children is counted once. */
export function planCounts(
  rows: { studentId: string; guardian: SlipGuardianState | null }[],
): SlipPlanCounts {
  const counts: SlipPlanCounts = {
    students: rows.length,
    slips: 0,
    create: 0,
    reset: 0,
    keep: 0,
    skip: 0,
  };
  const seen = new Set<string>();
  for (const row of rows) {
    const action = slipAction(row.guardian);
    if (action !== 'SKIP') counts.slips++;
    const id = row.guardian?.guardianId;
    if (id && seen.has(id)) continue;
    if (id) seen.add(id);
    if (action === 'CREATE') counts.create++;
    else if (action === 'RESET') counts.reset++;
    else if (action === 'KEEP') counts.keep++;
    else counts.skip++;
  }
  return counts;
}
