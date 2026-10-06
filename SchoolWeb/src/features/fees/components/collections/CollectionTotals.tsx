"use client";

import { MoneyText } from "@/components/shared/MoneyText";
import { StatCard } from "@/components/shared/StatCard";
import { PAYMENT_METHOD_OPTIONS } from "../../payment-options";
import type { DailyCollection } from "../../types";

interface CollectionTotalsProps {
  day: DailyCollection | undefined;
  loading: boolean;
}

/** Day total plus one card per payment method (methods with nothing collected show zero). */
export function CollectionTotals({ day, loading }: CollectionTotalsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Total collected" loading={loading} value={<MoneyText amountMinor={day?.totalMinor} />} />
      {PAYMENT_METHOD_OPTIONS.map((method) => {
        const row = day?.byMethod?.find((item) => item.method === method.id);
        return (
          <StatCard
            key={method.id}
            label={method.name}
            loading={loading}
            value={<MoneyText amountMinor={day ? (row?.amountMinor ?? 0) : undefined} />}
            hint={row?.count !== undefined ? `${row.count} ${row.count === 1 ? "payment" : "payments"}` : undefined}
          />
        );
      })}
    </div>
  );
}
