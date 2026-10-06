import { z } from "zod";
import { toIsoDate } from "@/lib/dates";
import { pad } from "@/lib/time";
import { blankToUndefined, isoDate, optionalText, timeOfDay } from "@/lib/validation";
import type { AdmissionFeeStatus, ApplicationTest, ConfirmInput, Decision, TestInput, TestResultInput } from "./types";

const DECIMAL = /^\d+(\.\d{1,2})?$/;

const decimalText = (label: string) =>
  z
    .string()
    .trim()
    .refine((value) => DECIMAL.test(value), { message: `Enter ${label} as a number` });

export const testSchema = z.object({
  date: isoDate,
  time: timeOfDay,
  venue: optionalText(120),
  notes: optionalText(500),
});
export type TestFormValues = z.infer<typeof testSchema>;

export function testFormDefaults(test: ApplicationTest | null): TestFormValues {
  const at = test?.scheduledAt ? new Date(test.scheduledAt) : null;
  return {
    date: at ? toIsoDate(at) : "",
    time: at ? `${pad(at.getHours())}:${pad(at.getMinutes())}` : "09:00",
    venue: test?.venue ?? "",
    notes: "",
  };
}

// Date and time are the school's local wall-clock time.
export const toTestInput = (values: TestFormValues): TestInput => ({
  scheduledAt: new Date(`${values.date}T${values.time}`).toISOString(),
  venue: blankToUndefined(values.venue),
  notes: blankToUndefined(values.notes),
});

export const resultSchema = z
  .object({ score: decimalText("the score"), maxScore: decimalText("the total marks"), remarks: optionalText(500) })
  .refine((values) => Number(values.maxScore) > 0, { path: ["maxScore"], message: "Total marks must be above 0" })
  .refine((values) => Number(values.score) <= Number(values.maxScore), {
    path: ["score"],
    message: "Score can't be more than the total marks",
  });
export type ResultFormValues = z.infer<typeof resultSchema>;

export const resultFormDefaults = (test: ApplicationTest | null): ResultFormValues => ({
  score: test?.score != null ? String(test.score) : "",
  maxScore: test?.maxScore != null ? String(test.maxScore) : "100",
  remarks: test?.remarks ?? "",
});

export const toResultInput = (values: ResultFormValues): TestResultInput => ({
  score: Number(values.score),
  maxScore: Number(values.maxScore),
  remarks: blankToUndefined(values.remarks),
});

export const decideSchema = z
  .object({ decision: z.string().min(1, "Choose a decision"), reason: optionalText(500) })
  .refine((values) => values.decision !== "REJECT" || !!values.reason.trim(), {
    path: ["reason"],
    message: "Enter the reason for rejecting",
  });
export type DecideFormValues = z.infer<typeof decideSchema>;

export const DECIDE_DEFAULTS: DecideFormValues = { decision: "", reason: "" };

export const toDecideInput = (values: DecideFormValues) => ({
  decision: values.decision as Decision,
  reason: blankToUndefined(values.reason),
});

export const confirmSchema = z
  .object({
    feeStatus: z.string().min(1, "Choose the admission fee status"),
    feeReference: optionalText(80),
    feeAmount: z.string().trim(),
    sectionId: z.string().min(1, "Choose a section"),
    admissionDate: isoDate,
  })
  .refine((values) => values.feeStatus !== "PAID" || DECIMAL.test(values.feeAmount), {
    path: ["feeAmount"],
    message: "Enter the amount received in rupees",
  });
export type ConfirmFormValues = z.infer<typeof confirmSchema>;

export const confirmFormDefaults = (): ConfirmFormValues => ({
  feeStatus: "",
  feeReference: "",
  feeAmount: "",
  sectionId: "",
  admissionDate: toIsoDate(new Date()),
});

export function toConfirmInput(values: ConfirmFormValues): ConfirmInput {
  const paid = values.feeStatus === "PAID";
  return {
    admissionFee: {
      status: values.feeStatus as AdmissionFeeStatus,
      ...(paid
        ? { reference: blankToUndefined(values.feeReference), amountMinor: Math.round(Number(values.feeAmount) * 100) }
        : {}),
    },
    sectionId: values.sectionId,
    admissionDate: values.admissionDate,
  };
}
