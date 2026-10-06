import { z } from "zod";
import { todayIso } from "@/lib/dates";
import { blankToUndefined, isoDate, requiredText } from "@/lib/validation";
import type { AttendanceStatus, StaffLeaveInput, StudentLeaveInput } from "./types";

const STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE", "HALF_DAY"] as const;
const LEAVE_TYPES = ["CASUAL", "SICK", "ANNUAL", "UNPAID", "OTHER"] as const;

export const correctionSchema = z.object({
  newStatus: z.enum(STATUSES, { errorMap: () => ({ message: "Pick the correct status" }) }),
  reason: requiredText("the reason", 500),
});
export type CorrectionValues = z.infer<typeof correctionSchema>;

export const correctionDefaults = (status: AttendanceStatus | null): CorrectionValues => ({
  newStatus: (status ?? "PRESENT") as CorrectionValues["newStatus"],
  reason: "",
});

const dateRange = {
  from: isoDate,
  to: isoDate,
  reason: requiredText("the reason", 500),
};

const toAfterFrom = (values: { from: string; to: string }) => !values.from || !values.to || values.to >= values.from;
const RANGE_ERROR = { message: "The last day must be on or after the first day", path: ["to"] };

export const studentLeaveSchema = z
  .object({ ...dateRange, attachmentFileId: z.string() })
  .refine(toAfterFrom, RANGE_ERROR);
export type StudentLeaveValues = z.infer<typeof studentLeaveSchema>;

export const studentLeaveDefaults = (): StudentLeaveValues => ({
  from: todayIso(),
  to: todayIso(),
  reason: "",
  attachmentFileId: "",
});

export const toStudentLeaveInput = (studentId: string, values: StudentLeaveValues): StudentLeaveInput => ({
  studentId,
  from: values.from,
  to: values.to,
  reason: values.reason.trim(),
  attachmentFileId: blankToUndefined(values.attachmentFileId),
});

export const staffLeaveSchema = z
  .object({ ...dateRange, type: z.enum(LEAVE_TYPES, { errorMap: () => ({ message: "Pick the leave type" }) }) })
  .refine(toAfterFrom, RANGE_ERROR);
export type StaffLeaveValues = z.infer<typeof staffLeaveSchema>;

/** No type preselected, so the select shows its placeholder. */
export const staffLeaveDefaults = (): Partial<StaffLeaveValues> => ({
  from: todayIso(),
  to: todayIso(),
  reason: "",
});

export const toStaffLeaveInput = (values: StaffLeaveValues): StaffLeaveInput => ({
  from: values.from,
  to: values.to,
  type: values.type,
  reason: values.reason.trim(),
});
