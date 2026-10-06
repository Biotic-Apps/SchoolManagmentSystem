import { z } from "zod";
import { toMinor } from "@/lib/money";
import { currentPeriod, isPeriod } from "@/lib/period";
import { blankToUndefined, requiredText } from "@/lib/validation";
import type { ConcessionInput } from "./concessions-api";
import type { ConcessionType } from "./types";

export const concessionSchema = z
  .object({
    studentId: z.string().min(1, "Choose a student"),
    feeHeadId: z.string(),
    type: z.enum(["PERCENT", "FIXED"]),
    percent: z.string().trim(),
    amount: z.string().trim(),
    from: z.string().refine(isPeriod, "Pick the first month"),
    to: z.string(),
    reason: requiredText("the reason", 500),
  })
  .superRefine((values, ctx) => {
    if (values.type === "PERCENT") {
      const percent = Number(values.percent);
      if (!/^\d+$/.test(values.percent) || percent < 1 || percent > 100) {
        ctx.addIssue({ code: "custom", path: ["percent"], message: "Enter a whole percentage from 1 to 100" });
      }
    } else if ((toMinor(values.amount) ?? 0) <= 0) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "Enter the concession amount, e.g. 1500" });
    }
    if (values.to && (!isPeriod(values.to) || values.to < values.from)) {
      ctx.addIssue({ code: "custom", path: ["to"], message: "The last month must be on or after the first month" });
    }
  });
export type ConcessionFormValues = z.infer<typeof concessionSchema>;

export const concessionDefaults = (): ConcessionFormValues => ({
  studentId: "",
  feeHeadId: "",
  type: "PERCENT",
  percent: "",
  amount: "",
  from: currentPeriod(),
  to: "",
  reason: "",
});

export function toConcessionInput(values: ConcessionFormValues): ConcessionInput {
  const type = values.type as ConcessionType;
  return {
    studentId: values.studentId,
    feeHeadId: blankToUndefined(values.feeHeadId),
    type,
    value: type === "PERCENT" ? Number(values.percent) : (toMinor(values.amount) ?? 0),
    from: values.from,
    to: blankToUndefined(values.to),
    reason: values.reason.trim(),
  };
}
