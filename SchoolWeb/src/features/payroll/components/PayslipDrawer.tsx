"use client";

import { FileText } from "lucide-react";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPeriod } from "@/lib/period";
import { useStaffPayslip } from "../payslip-api";
import type { PayrollLine } from "../types";
import { PayslipView } from "./PayslipView";

interface PayslipDrawerProps {
  line: PayrollLine | null;
  month: string;
  onClose: () => void;
}

export function PayslipDrawer({ line, month, onClose }: PayslipDrawerProps) {
  const query = useStaffPayslip(line?.staffId ?? null, month);
  return (
    <DetailDrawer
      open={!!line}
      onOpenChange={(open) => !open && onClose()}
      title={line ? `Payslip · ${line.name}` : "Payslip"}
      description={formatPeriod(month)}
    >
      {query.isLoading && <Skeleton className="h-64 w-full" />}
      {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {query.data === null && <EmptyState icon={FileText} title="No payslip for this month" />}
      {query.data && <PayslipView payslip={query.data} showName={false} />}
    </DetailDrawer>
  );
}
