"use client";

import { CheckCircle, Clock, XCircle } from "lucide-react";
import { MoneyText } from "@/components/shared/MoneyText";
import { formatDateTime } from "@/lib/format";
import type { OnlinePaymentStatus } from "../../online-payments-api";

const STATUS_ICONS: Record<string, { icon: typeof Clock; color: string }> = {
  SUCCESS: { icon: CheckCircle, color: "text-success" },
  FAILED: { icon: XCircle, color: "text-error" },
  EXPIRED: { icon: Clock, color: "text-fg-muted" },
  INITIATED: { icon: Clock, color: "text-warning" },
};

interface OnlinePaymentHistoryProps {
  payments: OnlinePaymentStatus[];
  currency?: string;
}

/** List of online payment attempts for an invoice. */
export function OnlinePaymentHistory({ payments, currency = "PKR" }: OnlinePaymentHistoryProps) {
  if (payments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium text-fg-muted">Online Payment Attempts</h4>
      <div className="flex flex-col gap-2">
        {payments.map((p) => {
          const config = STATUS_ICONS[p.status] ?? STATUS_ICONS.INITIATED;
          const Icon = config.icon;
          return (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 text-sm">
              <Icon className={`size-4 shrink-0 ${config.color}`} />
              <div className="flex flex-1 items-center justify-between gap-2">
                <div>
                  <span className="font-medium">{p.gateway === "JAZZCASH" ? "JazzCash" : "Easypaisa"}</span>
                  <span className="ml-2 text-fg-muted">{p.status.toLowerCase()}</span>
                </div>
                <div className="text-right">
                  <MoneyText amountMinor={p.amountMinor} currency={currency} />
                  <p className="text-xs text-fg-muted">{formatDateTime(p.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
