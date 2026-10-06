"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { usePaymentsTab } from "../../use-payments-tab";
import { RefundDialog } from "../refunds/RefundDialog";
import { PaymentFilterBar } from "./PaymentFilters";
import { ReceiptDialog } from "./ReceiptDialog";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { ReversePaymentDialog } from "./ReversePaymentDialog";

export function PaymentsTab({ branchId }: { branchId: string | null }) {
  const tab = usePaymentsTab(branchId);
  const { query, dialogs } = tab;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <PaymentFilterBar list={tab.list} cashierOptions={tab.cashierOptions} />
        {tab.canAdd && (
          <Button onClick={() => dialogs.record.show()}>
            <Plus />
            Record payment
          </Button>
        )}
      </div>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No payments"
        emptyDescription="Payments recorded at the counter and verified proofs appear here."
        pagination={tab.pagination}
      />
      <RecordPaymentDialog open={dialogs.record.open} onOpenChange={dialogs.record.onOpenChange} />
      <ReceiptDialog payment={dialogs.receipt.item} open={dialogs.receipt.open} onOpenChange={dialogs.receipt.onOpenChange} />
      <RefundDialog payment={dialogs.refund.item} open={dialogs.refund.open} onOpenChange={dialogs.refund.onOpenChange} />
      <ReversePaymentDialog payment={dialogs.reverse.item} open={dialogs.reverse.open} onOpenChange={dialogs.reverse.onOpenChange} />
    </div>
  );
}
