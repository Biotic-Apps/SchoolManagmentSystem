"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { MoneyText } from "@/components/shared/MoneyText";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useOnlinePaymentStatus } from "../../online-payments-api";

const STATUS_CONFIG = {
  SUCCESS: { icon: CheckCircle, color: "text-success", label: "Payment Successful", description: "Your payment has been received and recorded." },
  FAILED: { icon: XCircle, color: "text-error", label: "Payment Failed", description: "The payment could not be completed. Please try again." },
  EXPIRED: { icon: Clock, color: "text-fg-muted", label: "Payment Expired", description: "This payment session has expired. Please start a new payment." },
  INITIATED: { icon: Clock, color: "text-warning", label: "Processing", description: "Your payment is being processed. This may take a moment." },
} as const;

/** Shown after the parent returns from the gateway redirect. */
export function OnlinePaymentReturn() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const status = useOnlinePaymentStatus(paymentId);

  if (!paymentId) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <InlineNotice tone="error">No payment reference found.</InlineNotice>
        <Button variant="secondary" onClick={() => window.location.href = "/fees"}>
          Back to Fees
        </Button>
      </div>
    );
  }

  if (status.isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <Spinner className="size-8" />
        <p className="text-fg-muted">Checking payment status...</p>
      </div>
    );
  }

  const data = status.data;
  const config = data ? STATUS_CONFIG[data.status] : null;
  const Icon = config?.icon ?? Clock;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16">
      <div className={`rounded-full bg-surface-elevated p-4 ${config?.color ?? "text-fg-muted"}`}>
        <Icon className="size-12" />
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold">{config?.label ?? "Payment Status"}</h2>
        <p className="mt-1 text-fg-muted">{config?.description ?? ""}</p>
      </div>

      {data && (
        <div className="w-full rounded-xl border border-border bg-surface p-4">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-fg-muted">Amount</span>
              <MoneyText amountMinor={data.amountMinor} currency={data.currency} className="font-medium" />
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Gateway</span>
              <span className="font-medium">{data.gateway === "JAZZCASH" ? "JazzCash" : "Easypaisa"}</span>
            </div>
            {data.gatewayRef && (
              <div className="flex justify-between">
                <span className="text-fg-muted">Reference</span>
                <span className="font-mono text-xs">{data.gatewayRef}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <Button variant="primary" onClick={() => window.location.href = "/fees"}>
        Back to Fees
      </Button>
    </div>
  );
}
