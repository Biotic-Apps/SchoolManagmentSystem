"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePayrollSettings } from "../settings-api";
import { PayRulesForm } from "./PayRulesForm";

/** Pay rules apply to the whole school; the branch only supplies the staff timings shown in hints. */
export function PayRulesTab({ branchId }: { branchId: string | null }) {
  const query = usePayrollSettings(branchId);
  if (!branchId || query.isLoading) return <Skeleton className="h-96 w-full" />;
  if (query.error) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  if (!query.data) return null;
  // Keyed so the form resets when saved rules come back.
  return <PayRulesForm key={JSON.stringify(query.data)} branchId={branchId} view={query.data} />;
}
