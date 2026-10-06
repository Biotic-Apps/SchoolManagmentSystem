"use client";

import { MoneyText } from "@/components/shared/MoneyText";
import { StatCard } from "@/components/shared/StatCard";
import { formatDate } from "@/lib/format";
import type { FeeSummary } from "../../types";

interface FeeSummaryCardsProps {
  summary: FeeSummary | undefined;
  loading?: boolean;
}

/** Total due, overdue, advance, last payment and next due for one student. */
export function FeeSummaryCards({ summary, loading }: FeeSummaryCardsProps) {
  const last = summary?.lastPayment ?? null;
  const next = summary?.nextDue ?? null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Total due" loading={loading} value={<MoneyText amountMinor={summary?.totalDueMinor} />} />
      <StatCard label="Overdue" loading={loading} value={<MoneyText amountMinor={summary?.overdueMinor} />} />
      <StatCard
        label="Advance credit"
        loading={loading}
        value={<MoneyText amountMinor={summary?.advanceMinor} />}
        hint="Used against the next invoice"
      />
      <StatCard
        label="Last payment"
        loading={loading}
        value={last ? <MoneyText amountMinor={last.amountMinor} /> : undefined}
        hint={last ? formatDate(last.paidOn) : "No payments yet"}
      />
      <StatCard
        label="Next due"
        loading={loading}
        value={next ? <MoneyText amountMinor={next.balanceMinor} /> : undefined}
        hint={next ? `Due ${formatDate(next.dueDate)}` : "Nothing due"}
      />
    </div>
  );
}
