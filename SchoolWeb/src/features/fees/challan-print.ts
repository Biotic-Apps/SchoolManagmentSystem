import { z } from "zod";
import { http } from "@/lib/http";
import { currentPeriod, isPeriod } from "@/lib/period";
import { useApiMutation } from "@/lib/use-api-mutation";

/** POST /invoices/challans/print: one PDF of 3-copy bank challans for a month. */
export interface PrintChallansInput {
  branchId: string;
  period: string;
  classId?: string;
  sectionId?: string;
}

export interface PrintChallansJob {
  jobId: string;
  /** Challans (pages) in the PDF. */
  count: number;
}

export const printChallansSchema = z.object({
  period: z.string().refine(isPeriod, "Pick a month"),
  classId: z.string(),
  sectionId: z.string(),
});
export type PrintChallansValues = z.infer<typeof printChallansSchema>;

export const printChallansDefaults = (period: string, classId?: string): PrintChallansValues => ({
  period: period || currentPeriod(),
  classId: classId ?? "",
  sectionId: "",
});

export const toPrintChallansInput = (values: PrintChallansValues, branchId: string): PrintChallansInput => ({
  branchId,
  period: values.period,
  classId: values.classId || undefined,
  sectionId: values.classId && values.sectionId ? values.sectionId : undefined,
});

export function usePrintChallans() {
  return useApiMutation({
    mutationFn: async (input: PrintChallansInput) =>
      (await http.post<PrintChallansJob>("/invoices/challans/print", input)).data,
    toastError: false,
  });
}
