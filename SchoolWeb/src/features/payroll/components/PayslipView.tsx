import { DownloadButton } from "@/components/shared/DownloadButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { designationLabel } from "@/features/staff/options";
import { formatNumber } from "@/lib/format";
import { formatPeriod } from "@/lib/period";
import type { Payslip } from "../types";
import { AmountList } from "./AmountList";

/** One month's payslip: earnings, deductions, unpaid leave, adjustments and what is paid. */
export function PayslipView({ payslip, showName = true }: { payslip: Payslip; showName?: boolean }) {
  const gross = payslip.basicMinor + payslip.allowancesMinor;
  const leaveLabel = `Unpaid leave (${formatNumber(payslip.unpaidLeaveDays)} ${payslip.unpaidLeaveDays === 1 ? "day" : "days"})`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          {showName && <span className="text-body font-semibold text-fg">{payslip.name}</span>}
          <span className="text-label text-fg-muted">
            {[payslip.designation && designationLabel(payslip.designation), formatPeriod(payslip.month)].filter(Boolean).join(" · ")}
          </span>
        </div>
        {payslip.status && <StatusBadge status={payslip.status} />}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <AmountList
          title="Earnings"
          rows={[
            { label: "Basic salary", amountMinor: payslip.basicMinor },
            { label: "Allowances", amountMinor: payslip.allowancesMinor },
            { label: "Gross salary", amountMinor: gross, total: true },
          ]}
        />
        <AmountList
          title="Deductions"
          rows={[
            { label: "Deductions", amountMinor: payslip.deductionsMinor },
            { label: leaveLabel, amountMinor: payslip.leaveDeductionMinor },
            { label: "Total deductions", amountMinor: payslip.deductionsMinor + payslip.leaveDeductionMinor, total: true },
          ]}
        />
      </div>
      <AmountList
        title="Pay"
        rows={[
          { label: "Adjustments (bonus, arrears, advances)", amountMinor: payslip.adjustmentsMinor },
          { label: "Net salary", amountMinor: payslip.netMinor, total: true },
          { label: "Paid", amountMinor: payslip.paidMinor },
          { label: "Balance", amountMinor: payslip.balanceMinor, total: true },
        ]}
      />
      <div>
        <DownloadButton url={payslip.pdfUrl} label="Download payslip" />
      </div>
    </div>
  );
}
