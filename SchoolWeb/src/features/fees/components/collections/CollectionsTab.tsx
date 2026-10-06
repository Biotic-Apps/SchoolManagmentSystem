"use client";

import { Lock } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { DateStepper } from "@/components/shared/DateStepper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { todayIso } from "@/lib/dates";
import { useCollectionDay } from "../../use-collection-day";
import { CloseDayDialog } from "./CloseDayDialog";
import { CollectionClosingCard } from "./CollectionClosingCard";
import { CollectionTotals } from "./CollectionTotals";

export function CollectionsTab({ branchId }: { branchId: string | null }) {
  const view = useCollectionDay(branchId);
  const { query, day } = view;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <DateStepper value={view.date} onChange={view.setDate} max={todayIso()} label="Collection date" />
          {day && <StatusBadge status={view.closed ? "CLOSED" : "OPEN"} label={view.closed ? "Closed" : "Open"} />}
        </div>
        {view.canClose && (
          <Button onClick={() => view.setClosing(true)}>
            <Lock />
            Close day
          </Button>
        )}
      </div>
      <CollectionTotals day={day} loading={query.isLoading} />
      {view.closed && <CollectionClosingCard closing={day?.closing ?? null} expectedCashMinor={view.expectedCashMinor} />}
      <div className="flex flex-col gap-3">
        <SectionHeading title="By cashier" />
        <DataTable
          columns={view.cashierCols}
          rows={day?.byCashier}
          getRowId={(row) => row.cashier?.id ?? "unknown"}
          loading={query.isLoading}
          error={query.error}
          onRetry={() => query.refetch()}
          skeletonRows={2}
          emptyTitle="No collections"
          emptyDescription="Nothing was collected on this day."
        />
      </div>
      <div className="flex flex-col gap-3">
        <SectionHeading title="Payments" />
        <DataTable
          columns={view.paymentCols}
          rows={day?.payments}
          getRowId={(row) => row.id}
          loading={query.isLoading}
          error={query.error}
          onRetry={() => query.refetch()}
          emptyTitle="No payments"
          emptyDescription="Payments received on this day appear here."
        />
      </div>
      {branchId && (
        <CloseDayDialog
          branchId={branchId}
          date={view.date}
          expectedCashMinor={view.expectedCashMinor}
          open={view.closing}
          onOpenChange={view.setClosing}
        />
      )}
    </div>
  );
}
