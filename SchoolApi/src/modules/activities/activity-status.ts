import type { ActivityStatus } from '../../generated/prisma/client';
import type { ActivityStatusTarget } from './dto/activity-input.dto';

const FORWARD: Partial<Record<ActivityStatus, ActivityStatus>> = {
  ANNOUNCED: 'ONGOING',
  ONGOING: 'COMPLETED',
};

const CANCELLABLE = new Set<ActivityStatus>([
  'PROPOSED',
  'APPROVED',
  'ANNOUNCED',
  'ONGOING',
]);

/** ANNOUNCED → ONGOING → COMPLETED; anything still open may be CANCELLED. */
export function canMoveTo(
  from: ActivityStatus,
  to: ActivityStatusTarget,
): boolean {
  if (to === 'CANCELLED') return CANCELLABLE.has(from);
  return FORWARD[from] === to;
}

/** Statuses parents see. */
export const PUBLIC_STATUSES: ActivityStatus[] = [
  'ANNOUNCED',
  'ONGOING',
  'COMPLETED',
];
