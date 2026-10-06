import { useState } from "react";
import { currentPeriod } from "@/lib/period";
import { useFinanceDashboard } from "./dashboard-api";

/** The API may send the rate as a fraction (0–1) or a percentage (0–100). */
function toPercent(rate: number | null | undefined): number | null {
  if (rate === null || rate === undefined || Number.isNaN(rate)) return null;
  return rate <= 1 ? rate * 100 : rate;
}

export function useFinanceOverview(branchId: string | null) {
  const [month, setMonth] = useState(currentPeriod);
  const query = useFinanceDashboard(branchId, month);
  return {
    month,
    setMonth,
    maxMonth: currentPeriod(),
    query,
    data: query.data ?? null,
    ratePercent: toPercent(query.data?.collectionRate),
  };
}
