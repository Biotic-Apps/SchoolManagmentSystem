import { z } from "zod";
import { toIsoDate } from "@/lib/dates";
import { isoDate, requiredText } from "@/lib/validation";

const reason = requiredText("the reason", 500);

export const changeSectionSchema = z.object({
  sectionId: z.string().min(1, "Choose a section"),
  effectiveDate: isoDate,
  reason,
});
export type ChangeSectionValues = z.infer<typeof changeSectionSchema>;

export const transferSchema = z.object({
  toBranchId: z.string().min(1, "Choose the destination branch"),
  effectiveDate: isoDate,
  reason,
});
export type TransferValues = z.infer<typeof transferSchema>;

export const withdrawSchema = z.object({ effectiveDate: isoDate, reason });
export type WithdrawValues = z.infer<typeof withdrawSchema>;

export const acceptTransferSchema = z.object({ sectionId: z.string().min(1, "Choose a section") });
export type AcceptTransferValues = z.infer<typeof acceptTransferSchema>;

const today = () => toIsoDate(new Date());

export const changeSectionDefaults = (): ChangeSectionValues => ({ sectionId: "", effectiveDate: today(), reason: "" });
export const transferDefaults = (): TransferValues => ({ toBranchId: "", effectiveDate: today(), reason: "" });
export const withdrawDefaults = (): WithdrawValues => ({ effectiveDate: today(), reason: "" });
