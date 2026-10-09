"use client";

import { DetailList } from "@/components/shared/DetailList";
import { MoneyText } from "@/components/shared/MoneyText";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { formatDate } from "@/lib/format";
import type { Payment } from "../../types";
import { ReceiptDownload } from "./ReceiptDownload";

interface ReceiptDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Prepares the receipt PDF as soon as it opens. */
export function ReceiptDialog({ payment, open, onOpenChange }: ReceiptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Receipt {payment?.receiptNo}</DialogTitle>
          <DialogDescription>Choose A4 (school and student copies) or an 80 mm thermal slip. The PDF opens in a new tab.</DialogDescription>
        </DialogHeader>
        {payment && (
          <>
            <DetailList
              items={[
                { label: "Student", value: payment.student?.name },
                { label: "Amount", value: <MoneyText amountMinor={payment.amountMinor} currency={payment.currency} /> },
                { label: "Received on", value: formatDate(payment.receivedOn) },
              ]}
            />
            <DialogFooter>
              <ReceiptDownload key={payment.id} paymentId={payment.id} variant="primary" autoStart />
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
