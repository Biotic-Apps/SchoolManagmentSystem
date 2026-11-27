"use client";

import { useState } from "react";
import { CreditCard, ExternalLink } from "lucide-react";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { MoneyText } from "@/components/shared/MoneyText";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { errorMessage } from "@/lib/error-messages";
import { formatDate } from "@/lib/format";
import { useInitiateOnlinePayment } from "../../online-payments-api";
import type { Invoice } from "../../types";

const GATEWAY_INFO: Record<string, { name: string; description: string }> = {
  JAZZCASH: { name: "JazzCash", description: "Pay using JazzCash mobile wallet" },
  EASYPAISA: { name: "Easypaisa", description: "Pay using Easypaisa mobile wallet" },
  MANUAL: { name: "Online payment", description: "Pay through the school's online payment page" },
};

interface PayOnlineDialogProps {
  /** The invoice to start with (the oldest unpaid one from the page header). */
  invoice: Invoice | null;
  /** Unpaid invoices the parent may switch to. */
  invoices: Invoice[];
  /** The school's gateway key; null when online payment is off. */
  gateway: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayOnlineDialog({ invoice: initial, invoices, gateway, open, onOpenChange }: PayOnlineDialogProps) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const initiate = useInitiateOnlinePayment();
  const choices = invoices.length > 0 ? invoices : initial ? [initial] : [];
  const invoice = choices.find((row) => row.id === pickedId) ?? initial ?? choices[0] ?? null;
  const options = gateway && GATEWAY_INFO[gateway] ? [{ id: gateway, ...GATEWAY_INFO[gateway] }] : [];
  // The school runs a single wallet, so it is picked for the parent.
  const chosen = selected ?? (options.length === 1 ? options[0].id : null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPickedId(null);
      setSelected(null);
      initiate.reset();
    }
    onOpenChange(next);
  };

  const handlePay = () => {
    if (!invoice || !chosen) return;
    initiate.mutate(
      { invoiceId: invoice.id, gateway: chosen },
      {
        onSuccess: (result) => {
          if (!result) return;
          // Form-post gateways (JazzCash/Easypaisa) need a hidden form; others redirect.
          if (result.formData) submitGatewayForm(result.redirectUrl, result.formData);
          else window.location.href = result.redirectUrl;
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Online</DialogTitle>
          <DialogDescription>
            {invoice && (
              <span>
                Pay <MoneyText amountMinor={invoice.balanceMinor} currency={invoice.currency} className="font-semibold" /> for
                invoice {invoice.invoiceNo}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {choices.length > 1 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-fg-muted">Invoice to pay (oldest due first):</p>
            {choices.map((row) => (
              <button
                key={row.id}
                type="button"
                aria-pressed={invoice?.id === row.id}
                onClick={() => setPickedId(row.id)}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2 text-left text-sm transition-colors ${
                  invoice?.id === row.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-selected"
                }`}
              >
                <span>
                  {row.invoiceNo} · due {formatDate(row.dueDate)}
                </span>
                <MoneyText amountMinor={row.balanceMinor} currency={row.currency} />
              </button>
            ))}
          </div>
        )}

        {options.length === 0 ? (
          <InlineNotice>
            Online payment is not available for this school yet. Pay at the school office or bank, then upload a payment
            proof.
          </InlineNotice>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-fg-muted">Payment method:</p>
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={chosen === option.id}
                onClick={() => setSelected(option.id)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                  chosen === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-selected"
                }`}
              >
                <CreditCard className="size-5 shrink-0 text-fg-muted" />
                <div>
                  <p className="font-medium">{option.name}</p>
                  <p className="text-sm text-fg-muted">{option.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {initiate.error && <InlineNotice tone="error">{errorMessage(initiate.error)}</InlineNotice>}

        <DialogFooter>
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePay} disabled={!chosen || !invoice} loading={initiate.isPending}>
            <ExternalLink />
            Pay now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Submit a hidden form to the gateway (JazzCash / Easypaisa redirect). */
function submitGatewayForm(actionUrl: string, fields: Record<string, string>): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  form.style.display = "none";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}
