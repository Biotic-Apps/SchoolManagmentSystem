import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";

export interface IdCardPrintInput {
  sectionId?: string;
  branchId?: string;
  classId?: string;
}

/** Queues A4 sheets of ID cards (10 per page, cut marks) for a section or class. */
export function usePrintIdCards() {
  return useApiMutation({
    mutationFn: async (input: IdCardPrintInput) =>
      (await http.post<{ jobId: string; count: number }>("/students/id-cards/print", input)).data,
  });
}
