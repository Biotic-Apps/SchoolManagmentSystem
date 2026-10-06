"use client";

import { AlarmClock, Banknote, CalendarCheck, FileText, Receipt, Users, Wallet } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { MoneyText } from "@/components/shared/MoneyText";
import { PeriodStepper } from "@/components/shared/PeriodStepper";
import { StatCard } from "@/components/shared/StatCard";
import { useFinanceOverview } from "../../use-finance-overview";
import { CollectionRateCard } from "./CollectionRateCard";

export function FinanceOverviewTab({ branchId }: { branchId: string | null }) {
  const overview = useFinanceOverview(branchId);
  const { data, query } = overview;
  const loading = query.isLoading;

  if (!branchId) return <InlineNotice>Choose a branch to see its finances.</InlineNotice>;

  const stats = [
    { label: "Billed", icon: FileText, value: data?.billedMinor },
    { label: "Collected", icon: Wallet, value: data?.collectedMinor },
    { label: "Outstanding", icon: Receipt, value: data?.outstandingMinor },
    { label: "Overdue", icon: AlarmClock, value: data?.overdueMinor },
    { label: "Collected today", icon: CalendarCheck, value: data?.todayCollectedMinor },
    { label: "Expenses", icon: Banknote, value: data?.expensesMinor },
    { label: "Payroll", icon: Users, value: data?.payrollMinor },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PeriodStepper value={overview.month} onChange={overview.setMonth} max={overview.maxMonth} />
      {query.error ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          <CollectionRateCard percent={overview.ratePercent} loading={loading} />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                icon={stat.icon}
                loading={loading}
                value={data ? <MoneyText amountMinor={stat.value} /> : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
