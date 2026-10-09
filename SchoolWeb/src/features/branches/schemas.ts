import { z } from "zod";
import {
  blankToNull,
  optionalEmail,
  optionalPhone,
  optionalText,
  requiredText,
  timeOfDay,
} from "@/lib/validation";
import { checkBranchTimings, withStaffDefaults } from "./timing-rules";
import type { Branch, BranchInput } from "./types";

const DEFAULT_TIMINGS = { opensAt: "08:00", closesAt: "14:00", attendanceLockAt: "11:00" };
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5, 6];

export const branchSchema = z
  .object({
    schoolId: z.string().min(1, "Pick a school"),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{2,12}$/, "Use 2–12 uppercase letters or digits"),
    name: requiredText("the branch name"),
    address: optionalText(),
    phone: optionalPhone,
    email: optionalEmail,
    opensAt: timeOfDay,
    closesAt: timeOfDay,
    attendanceLockAt: timeOfDay,
    staffArrivesAt: timeOfDay,
    staffLeavesAt: timeOfDay,
    workingDays: z.array(z.number().int().min(1).max(7)).min(1, "Pick at least one working day"),
  })
  .superRefine(checkBranchTimings);

export type BranchFormValues = z.infer<typeof branchSchema>;

export function branchFormDefaults(branch: Branch | null, schoolId: string | null): BranchFormValues {
  const timings = withStaffDefaults(branch?.timings ?? DEFAULT_TIMINGS);
  return {
    schoolId: branch?.schoolId ?? schoolId ?? "",
    code: branch?.code ?? "",
    name: branch?.name ?? "",
    address: branch?.address ?? "",
    phone: branch?.phone ?? "",
    email: branch?.email ?? "",
    opensAt: timings.opensAt,
    closesAt: timings.closesAt,
    attendanceLockAt: timings.attendanceLockAt,
    staffArrivesAt: timings.staffArrivesAt,
    staffLeavesAt: timings.staffLeavesAt,
    workingDays: branch?.workingDays?.length ? branch.workingDays : DEFAULT_WORKING_DAYS,
  };
}

export function toBranchInput(values: BranchFormValues, isEdit: boolean): BranchInput {
  return {
    ...(isEdit ? {} : { schoolId: values.schoolId, code: values.code }),
    name: values.name.trim(),
    address: blankToNull(values.address),
    phone: blankToNull(values.phone),
    email: blankToNull(values.email),
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
