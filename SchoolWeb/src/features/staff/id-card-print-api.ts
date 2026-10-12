import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";

export interface StaffIdCardPrintInput {
  branchId: string;
  designation?: string;
}

/** Queues A4 sheets of ID cards (10 per page, cut marks) for all active staff in a branch. */
export function usePrintStaffIdCards() {
  return useApiMutation({
    mutationFn: async (input: StaffIdCardPrintInput) =>
      (await http.post<{ jobId: string; count: number }>("/staff/id-cards/print", input)).data,
  });
}
