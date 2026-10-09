"use client";

import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DownloadButton } from "@/components/shared/DownloadButton";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { formatPeriod } from "@/lib/period";
import { useStaffPayslip } from "../payslip-api";
import type { PayrollLine } from "../types";
import { PayslipView } from "./PayslipView";

interface PayslipDrawerProps {
  line: PayrollLine | null;
  month: string;
  /** PDF payslips exist once the run is approved. */
  approved: boolean;
  onClose: () => void;
}

/** Breakdown of one run line; the PDF download appears after approval. */
export function PayslipDrawer({ line, month, approved, onClose }: PayslipDrawerProps) {
  const slip = useStaffPayslip(approved ? (line?.staffId ?? null) : null, month);
  const pdfUrl = slip.data?.pdfUrl ?? null;
  return (
    <DetailDrawer
      open={!!line}
      onOpenChange={(open) => !open && onClose()}
      title={line ? `Salary breakdown · ${line.name}` : "Salary breakdown"}
      description={formatPeriod(month)}
    >
      {line && (
        <PayslipView
          line={line}
          month={month}
          showName={false}
          actions={
            approved ? (
              <DownloadButton url={pdfUrl} label={slip.isLoading || slip.data?.pdfStatus === "PENDING" ? "Preparing payslip PDF" : "Download payslip PDF"} />
            ) : (
              <InlineNotice>The payslip PDF is made when this payroll is approved. Use “Print all payslips” for a draft copy.</InlineNotice>
            )
          }
        />
      )}
    </DetailDrawer>
  );
}
