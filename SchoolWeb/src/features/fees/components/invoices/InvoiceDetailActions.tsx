"use client";

import { BookOpen, Send, Wallet, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { InvoiceDetail } from "../../use-invoice-detail";

export function InvoiceDetailActions({ detail }: { detail: InvoiceDetail }) {
  const { rights } = detail;
  return (
    <>
      {rights.issue && (
        <Button size="sm" loading={detail.issuing} onClick={detail.issueInvoice}>
          <Send />
          Issue
        </Button>
      )}
      {rights.pay && (
        <Button size="sm" onClick={() => detail.openDialog("payment")}>
          <Wallet />
          Record payment
        </Button>
      )}
      <Button variant="secondary" size="sm" onClick={() => detail.openDialog("ledger")}>
        <BookOpen />
        Student ledger
      </Button>
      {rights.cancel && (
        <Button variant="danger" size="sm" onClick={() => detail.openDialog("cancel")}>
          <XCircle />
          Cancel invoice
        </Button>
      )}
    </>
  );
}
