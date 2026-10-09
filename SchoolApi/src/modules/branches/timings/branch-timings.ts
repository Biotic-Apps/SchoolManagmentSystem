import type { BranchTimingsDto } from '../dto/branch.dto';

/** Minutes teachers arrive before students when no staff time is given. */
export const STAFF_LEAD_MINUTES = 30;

type TimingsInput = Omit<BranchTimingsDto, 'staffArrivesAt' | 'staffLeavesAt'> &
  Partial<Pick<BranchTimingsDto, 'staffArrivesAt' | 'staffLeavesAt'>>;

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const toHhMm = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** opensAt minus the lead time, never earlier than 00:00. */
export function defaultStaffArrival(opensAt: string): string {
  return toHhMm(Math.max(0, toMinutes(opensAt) - STAFF_LEAD_MINUTES));
}

/** Fills the staff times a client left out (also used for legacy rows). */
export function withStaffDefaults(t: TimingsInput): BranchTimingsDto {
  return {
    opensAt: t.opensAt,
    closesAt: t.closesAt,
    attendanceLockAt: t.attendanceLockAt,
    staffArrivesAt: t.staffArrivesAt ?? defaultStaffArrival(t.opensAt),
    staffLeavesAt: t.staffLeavesAt ?? t.closesAt,
  };
}
