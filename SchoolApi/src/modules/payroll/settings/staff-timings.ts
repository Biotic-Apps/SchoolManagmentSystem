import type { BranchTimingsDto } from '../../branches/dto/branch.dto';
import { withStaffDefaults } from '../../branches/timings/branch-timings';

export interface StaffTimes {
  arrivesAt: string;
  leavesAt: string;
}

/** Staff arrive/leave times from `Branch.timings` (30-minute lead default); null when unset. */
export function staffTimings(timings: unknown): StaffTimes | null {
  if (!timings || typeof timings !== 'object') return null;
  const t = timings as Partial<BranchTimingsDto>;
  if (!t.opensAt || !t.closesAt) return null;
  const full = withStaffDefaults(t as BranchTimingsDto);
  return { arrivesAt: full.staffArrivesAt, leavesAt: full.staffLeavesAt };
}
