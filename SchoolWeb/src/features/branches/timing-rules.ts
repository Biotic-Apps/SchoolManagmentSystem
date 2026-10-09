import type { z } from "zod";
import type { BranchTimings } from "./types";

/** Teachers arrive this many minutes before students when no time is set (matches the API). */
const STAFF_LEAD_MINUTES = 30;

type TimingValues = Omit<BranchTimings, "staffArrivesAt" | "staffLeavesAt"> &
  Partial<Pick<BranchTimings, "staffArrivesAt" | "staffLeavesAt">>;

const pad = (n: number) => String(n).padStart(2, "0");

/** "08:00" → "07:30", never earlier than midnight. */
export function defaultStaffArrival(opensAt: string): string {
  const [h, m] = opensAt.split(":").map(Number);
  const minutes = Math.max(0, h * 60 + m - STAFF_LEAD_MINUTES);
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** Fills staff times missing from older branches. */
export function withStaffDefaults(timings: TimingValues): BranchTimings {
  return {
    ...timings,
    staffArrivesAt: timings.staffArrivesAt ?? defaultStaffArrival(timings.opensAt),
    staffLeavesAt: timings.staffLeavesAt ?? timings.closesAt,
  };
}

/** Shared zod superRefine for branch timing fields (branch form + setup wizard). */
export function checkBranchTimings(v: BranchTimings, ctx: z.RefinementCtx): void {
  const issue = (path: keyof BranchTimings, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
  if (v.closesAt <= v.opensAt) issue("closesAt", "Closing time must be after opening time");
  if (v.attendanceLockAt < v.opensAt || v.attendanceLockAt > v.closesAt)
    issue("attendanceLockAt", "Attendance lock must fall within school hours");
  if (v.staffArrivesAt > v.opensAt) issue("staffArrivesAt", "Teachers must arrive by the time school opens");
  if (v.staffLeavesAt < v.closesAt) issue("staffLeavesAt", "Teachers can't leave before school closes");
}
