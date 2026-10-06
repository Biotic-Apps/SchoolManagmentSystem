import { z, type ZodType, type ZodTypeAny } from "zod";
import { todayIso } from "@/lib/dates";
import { currentPeriod, isPeriod } from "@/lib/period";
import type { Report, ReportFormat, ReportParam, ReportRequest } from "./types";

export type ReportFormValues = Record<string, string>;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function fieldRule(param: ReportParam): ZodTypeAny {
  const base = z.string().trim();
  const filled = param.required ? base.min(1, `Enter ${param.label.toLowerCase()}`) : base;
  if (param.type === "date") return filled.refine((value) => !value || DATE.test(value), "Pick a date");
  if (param.type === "month") return filled.refine((value) => !value || isPeriod(value), "Pick a month");
  if (param.type === "number") {
    return filled.refine((value) => !value || /^\d+$/.test(value), "Use a whole number");
  }
  return filled;
}

/** Built per report: one string field per parameter plus the format. */
export function reportSchema(report: Report): ZodType<ReportFormValues> {
  const shape: Record<string, ZodTypeAny> = { format: z.string().min(1, "Choose a format") };
  for (const param of report.params) shape[param.name] = fieldRule(param);
  return z
    .object(shape)
    .refine((values) => !values.from || !values.to || values.from <= values.to, {
      path: ["to"],
      message: "The end date is before the start date",
    }) as unknown as ZodType<ReportFormValues>;
}

interface DefaultContext {
  branchId: string | null;
}

export function reportDefaults(report: Report, { branchId }: DefaultContext): ReportFormValues {
  const today = todayIso();
  const values: ReportFormValues = { format: report.formats[0] };
  for (const param of report.params) {
    if (param.type === "branch") values[param.name] = branchId ?? "";
    else if (param.type === "month") values[param.name] = currentPeriod();
    else if (param.name === "from") values[param.name] = `${today.slice(0, 7)}-01`;
    else if (param.name === "to") values[param.name] = today;
    else values[param.name] = "";
  }
  return values;
}

export function toReportRequest(report: Report, values: ReportFormValues): ReportRequest {
  const params: ReportRequest["params"] = {};
  for (const param of report.params) {
    const value = (values[param.name] ?? "").trim();
    if (!value) continue;
    params[param.name] = param.type === "number" ? Number(value) : value;
  }
  return { key: report.key, params, format: values.format as ReportFormat };
}
