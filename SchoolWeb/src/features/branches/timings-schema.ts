import { z } from "zod";
import { timeOfDay } from "@/lib/validation";
import { checkBranchTimings, withStaffDefaults } from "./timing-rules";
import type { Branch, BranchTimings } from "./types";

const DEFAULT_TIMINGS = { opensAt: "08:00", closesAt: "14:00", attendanceLockAt: "11:00" };
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5, 6];

/** Timing + working-day fields shared by the full branch form and the principal's timings form. */
export const branchTimingFields = {
  opensAt: timeOfDay,
  closesAt: timeOfDay,
  attendanceLockAt: timeOfDay,
  staffArrivesAt: timeOfDay,
  staffLeavesAt: timeOfDay,
  workingDays: z.array(z.number().int().min(1).max(7)).min(1, "Pick at least one working day"),
};

export const branchTimingsSchema = z.object(branchTimingFields).superRefine(checkBranchTimings);

export type BranchTimingsFormValues = z.infer<typeof branchTimingsSchema>;

export function branchTimingDefaults(branch: Branch | null): BranchTimingsFormValues {
  return {
    ...withStaffDefaults(branch?.timings ?? DEFAULT_TIMINGS),
    workingDays: branch?.workingDays?.length ? branch.workingDays : DEFAULT_WORKING_DAYS,
  };
}

/** Request body part for PATCH /branches/:id. */
export function toTimingsInput(values: BranchTimingsFormValues): { timings: BranchTimings; workingDays: number[] } {
  return {
    timings: {
      opensAt: values.opensAt,
      closesAt: values.closesAt,
      attendanceLockAt: values.attendanceLockAt,
      staffArrivesAt: values.staffArrivesAt,
      staffLeavesAt: values.staffLeavesAt,
    },
    workingDays: values.workingDays,
  };
}
