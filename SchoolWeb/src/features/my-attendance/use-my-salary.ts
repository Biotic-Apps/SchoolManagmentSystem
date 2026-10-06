import { useState } from "react";
import { useMyPayslip } from "@/features/payroll/payslip-api";
import { currentPeriod } from "@/lib/period";

/** The signed-in staff member's own payslip for a chosen month (up to the current one). */
export function useMySalary() {
  const [month, setMonth] = useState(currentPeriod());
  const query = useMyPayslip(month);
  return { month, setMonth, max: currentPeriod(), query, payslip: query.data ?? null };
}
