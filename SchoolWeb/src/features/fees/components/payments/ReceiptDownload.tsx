"use client";

import { SegmentedControl } from "@/components/shared/SegmentedControl";
import type { ButtonProps } from "@/components/ui/Button";
import { RECEIPT_FORMAT_OPTIONS, receiptPath, useReceiptFormat } from "../../use-receipt-format";
import { FileLinkButton } from "./FileLinkButton";

interface ReceiptDownloadProps {
  paymentId: string;
  autoStart?: boolean;
  variant?: ButtonProps["variant"];
}

/** Printer choice (A4 school + student copies, or 80 mm thermal) and the receipt download. */
export function ReceiptDownload({ paymentId, autoStart, variant = "secondary" }: ReceiptDownloadProps) {
  const { format, setFormat } = useReceiptFormat();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SegmentedControl label="Receipt format" options={RECEIPT_FORMAT_OPTIONS} value={format} onChange={setFormat} />
      <FileLinkButton
        key={`${paymentId}-${format}`}
        path={receiptPath(paymentId, format)}
        label={format === "thermal" ? "Print 80 mm receipt" : "Print receipt"}
        variant={variant}
        autoStart={autoStart}
      />
    </div>
  );
}
