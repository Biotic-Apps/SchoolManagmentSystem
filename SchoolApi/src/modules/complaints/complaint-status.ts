import type { ComplaintStatus } from '../../generated/prisma/client';

export const CLOSED_STATUSES: ComplaintStatus[] = ['RESOLVED', 'CLOSED'];

export const REOPEN_WINDOW_MS = 7 * 86_400_000;

export const DEFAULT_SLA_HOURS = 48;

export const MAX_ESCALATION_LEVEL = 2;

export const isOpen = (status: ComplaintStatus): boolean =>
  !CLOSED_STATUSES.includes(status);
