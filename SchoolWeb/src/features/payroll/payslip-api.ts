import { useQuery } from "@tanstack/react-query";
import { hasErrorCode } from "@/lib/api-error";
import { http } from "@/lib/http";
import { payrollKeys } from "./keys";
import { toPayslip } from "./normalize";
import type { Payslip } from "./types";

/** A month without a payslip resolves to null instead of an error. */
async function fetchPayslip(path: string, month: string): Promise<Payslip | null> {
  try {
    return toPayslip((await http.get<unknown>(path, { month })).data);
  } catch (error) {
    if (hasErrorCode(error, "NOT_FOUND")) return null;
    throw error;
  }
}

export function useStaffPayslip(staffId: string | null, month: string) {
  return useQuery({
    queryKey: payrollKeys.payslip(staffId, month),
    queryFn: () => fetchPayslip(`/payslips/${staffId}`, month),
    enabled: !!staffId,
  });
}

export function useMyPayslip(month: string) {
  return useQuery({
    queryKey: payrollKeys.myPayslip(month),
    queryFn: () => fetchPayslip("/payslips/me", month),
  });
}
