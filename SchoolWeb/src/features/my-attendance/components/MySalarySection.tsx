"use client";

import { WalletCards } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PeriodStepper } from "@/components/shared/PeriodStepper";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { PayslipView } from "@/features/payroll/components/PayslipView";
import { useMySalary } from "../use-my-salary";

/** Own payslip per month with the PDF; only the signed-in staff member's salary is shown. */
export function MySalarySection() {
  const mine = useMySalary();
  const { query } = mine;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-card-title font-semibold text-fg">My salary</h3>
        <PeriodStepper value={mine.month} onChange={mine.setMonth} max={mine.max} />
      </div>
      <Card>
        {query.isLoading && (
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        )}
        {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
        {query.isSuccess && !mine.payslip && (
          <EmptyState
            icon={WalletCards}
            title="No payslip for this month"
            description="Your payslip appears here once the month's payroll is calculated."
          />
        )}
        {mine.payslip && (
          <CardContent>
            <PayslipView payslip={mine.payslip} showName={false} />
          </CardContent>
        )}
      </Card>
    </section>
  );
}
