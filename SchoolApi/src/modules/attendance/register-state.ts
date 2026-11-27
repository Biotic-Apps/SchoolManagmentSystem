import type { RegisterStatus } from '../../generated/prisma/client';

export type RegisterAction = 'SAVE_DRAFT' | 'SUBMIT';

export type RegisterCheck =
  'OK' | 'ALREADY_SUBMITTED' | 'LOCKED' | 'PENDING_REVIEW';

export interface RegisterState {
  status: RegisterStatus;
  submittedById: string | null;
}

/**
 * Register status machine (contract §1):
 * (none) → DRAFT → SUBMITTED → LOCKED; PENDING_REVIEW while a probation
 * submit waits. Only the submitter may re-submit, and only before the lock:
 * once the branch lock time passed (`pastLock`) a submitted register counts
 * as LOCKED even if the lock job has not run yet.
 */
export function checkRegisterAction(
  register: RegisterState | null,
  action: RegisterAction,
  userId: string,
  pastLock = false,
): RegisterCheck {
  if (!register || register.status === 'DRAFT') return 'OK';
  switch (register.status) {
    case 'LOCKED':
      return 'LOCKED';
    case 'PENDING_REVIEW':
      return 'PENDING_REVIEW';
    case 'SUBMITTED':
      if (pastLock) return 'LOCKED';
      return action === 'SUBMIT' && register.submittedById === userId
        ? 'OK'
        : 'ALREADY_SUBMITTED';
    default:
      return 'OK';
  }
}
