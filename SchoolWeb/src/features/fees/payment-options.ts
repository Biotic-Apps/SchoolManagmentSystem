import type { Option } from "@/components/shared/OptionSelect";
import type { PaymentMethod } from "./types";

export const PAYMENT_METHOD_OPTIONS: Option[] = [
  { id: "CASH", name: "Cash" },
  { id: "BANK", name: "Bank transfer" },
  { id: "CHEQUE", name: "Cheque" },
  { id: "ONLINE", name: "Online" },
];

/** Refunds go back by hand; online refunds are not offered while the gateway is manual. */
export const REFUND_METHOD_OPTIONS: Option[] = PAYMENT_METHOD_OPTIONS.filter((option) => option.id !== "ONLINE");

/** Methods where the bank / cheque reference is needed to reconcile. */
export const REFERENCE_METHODS = new Set<string>(["BANK", "CHEQUE"]);

export function paymentMethodLabel(method: PaymentMethod | string): string {
  return PAYMENT_METHOD_OPTIONS.find((option) => option.id === method)?.name ?? method;
}
