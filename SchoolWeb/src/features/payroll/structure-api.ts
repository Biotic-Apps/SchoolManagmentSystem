import { useQuery } from "@tanstack/react-query";
import { hasErrorCode } from "@/lib/api-error";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { payrollKeys } from "./keys";
import { toStructureHistory } from "./normalize";
import type { SalaryStructureInput } from "./types";

/** A staff member without a structure yet comes back as an empty history. */
export function useSalaryStructure(staffId: string | null) {
  return useQuery({
    queryKey: payrollKeys.structure(staffId),
    queryFn: async () => {
      try {
        return toStructureHistory((await http.get<unknown>(`/staff/${staffId}/salary-structure`)).data);
      } catch (error) {
        if (hasErrorCode(error, "NOT_FOUND")) return toStructureHistory(null);
        throw error;
      }
    },
    enabled: !!staffId,
  });
}

export function useSaveSalaryStructure(staffId: string) {
  return useApiMutation({
    mutationFn: (input: SalaryStructureInput) => http.put(`/staff/${staffId}/salary-structure`, input),
    invalidate: [payrollKeys.structure(staffId)],
    success: "Salary structure saved",
    toastError: false,
  });
}
