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
import { useInitiateOnlinePayment } from "../../online-payments-api";
import type { Invoice } from "../../types";

type GatewayChoice = "JAZZCASH" | "EASYPAISA";

const GATEWAY_OPTIONS: { id: GatewayChoice; name: string; description: string }[] = [
  { id: "JAZZCASH", name: "JazzCash", description: "Pay using JazzCash mobile wallet" },
  { id: "EASYPAISA", name: "Easypaisa", description: "Pay using Easypaisa mobile wallet" },
];

interface PayOnlineDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayOnlineDialog({ invoice, open, onOpenChange }: PayOnlineDialogProps) {
  const [selected, setSelected] = useState<GatewayChoice | null>(null);
  const initiate = useInitiateOnlinePayment();

  const handlePay = () => {
    if (!invoice) return;
    initiate.mutate(invoice.id, {
      onSuccess: (result) => {
        if (!result) return;
        // For form-post gateways (JazzCash/Easypaisa), we need to submit a hidden form
        if (result.formData) {
          submitGatewayForm(result.redirectUrl, result.formData);
        } else {
          // Direct redirect
          window.location.href = result.redirectUrl;
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        <div className="flex flex-col gap-3">
          <p className="text-sm text-fg-muted">Choose a payment method:</p>
          {GATEWAY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                selected === option.id
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

        {initiate.error && (
          <InlineNotice tone="error">{errorMessage(initiate.error)}</InlineNotice>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePay}
            disabled={!selected}
            loading={initiate.isPending}
          >
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
