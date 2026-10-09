"use client";

import { CircleCheck } from "lucide-react";
import { DetailList } from "@/components/shared/DetailList";
import { MoneyText } from "@/components/shared/MoneyText";
import { Button } from "@/components/ui/Button";
import { DialogFooter } from "@/components/ui/Dialog";
import { formatDate } from "@/lib/format";
import { paymentMethodLabel } from "../../payment-options";
import type { Payment } from "../../types";
import { ReceiptDownload } from "./ReceiptDownload";

/** Confirmation after recording: receipt number and the receipt download. */
export function PaymentRecordedView({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-input bg-success-soft px-3 py-2.5 text-label text-success">
        <CircleCheck className="size-4 shrink-0" />
        <span>Payment recorded. Receipt {payment.receiptNo} is ready to print.</span>
      </div>
      <DetailList
        items={[
          { label: "Receipt no.", value: payment.receiptNo },
          { label: "Student", value: payment.student?.name },
          { label: "Amount", value: <MoneyText amountMinor={payment.amountMinor} /> },
          { label: "Method", value: paymentMethodLabel(payment.method) },
          { label: "Received on", value: formatDate(payment.receivedOn) },
          ...(payment.advanceMinor
            ? [{ label: "Kept as advance credit", value: <MoneyText amountMinor={payment.advanceMinor} /> }]
            : []),
        ]}
      />
      <DialogFooter>
        <ReceiptDownload paymentId={payment.id} />
        <Button onClick={onClose}>Done</Button>
      </DialogFooter>
    </div>
  );
}
