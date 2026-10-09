import { useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useCurrentUserId } from "@/features/auth/use-can";

export type ReceiptFormat = "a4" | "thermal";

export const RECEIPT_FORMAT_OPTIONS: Option[] = [
  { id: "a4", name: "A4 · 2 copies" },
  { id: "thermal", name: "Thermal 80 mm" },
];

const PREFIX = "eschool.receiptFormat.";

function read(userId: string | null): ReceiptFormat {
  try {
    return userId && window.localStorage.getItem(PREFIX + userId) === "thermal" ? "thermal" : "a4";
  } catch {
    return "a4";
  }
}

/** API path of a payment's receipt in the chosen format. */
export const receiptPath = (paymentId: string, format: ReceiptFormat) =>
  `/payments/${paymentId}/receipt?format=${format}`;

/** Receipt printer choice (A4 or 80 mm thermal), remembered per user on this device. */
export function useReceiptFormat() {
  const userId = useCurrentUserId();
  const [format, setFormatState] = useState<ReceiptFormat>(() => read(userId));
  const setFormat = (value: string) => {
    const next: ReceiptFormat = value === "thermal" ? "thermal" : "a4";
    setFormatState(next);
    try {
      if (userId) window.localStorage.setItem(PREFIX + userId, next);
    } catch {
      // Storage blocked: the choice lasts for this visit only.
    }
  };
  return { format, setFormat };
}
