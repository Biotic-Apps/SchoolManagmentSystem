export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MINUTES = 15;

export function lockoutUntil(now: Date): Date {
  return new Date(now.getTime() + LOCKOUT_MINUTES * 60_000);
}
