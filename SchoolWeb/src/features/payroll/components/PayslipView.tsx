import type { ReactNode } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { designationLabel } from "@/features/staff/options";
import { formatNumber } from "@/lib/format";
import { formatPeriod } from "@/lib/period";
import type { BreakdownItem, PayBreakdown, PayrollLine } from "../types";
import { AmountList } from "./AmountList";
import { AttendanceStrip } from "./AttendanceStrip";
import { BreakdownList } from "./BreakdownList";

interface PayslipViewProps {
  line: PayrollLine;
  month: string | null;
  showName?: boolean;
  /** Download / print buttons under the slip. */
  actions?: ReactNode;
}

/** Lines calculated before itemised breakdowns: rebuild the rows from the totals. */
function fallbackBreakdown(line: PayrollLine): PayBreakdown {
  const earnings: BreakdownItem[] = [
    { label: "Basic salary", note: null, amountMinor: line.basicMinor },
    { label: "Allowances", note: null, amountMinor: line.allowancesMinor },
  ];
  const deductions: BreakdownItem[] = [{ label: "Deductions", note: null, amountMinor: line.deductionsMinor }];
  if (line.leaveDeductionMinor > 0)
    deductions.push({ label: "Unpaid leave", note: `${formatNumber(line.unpaidLeaveDays)} days`, amountMinor: line.leaveDeductionMinor });
  if (line.adjustmentsMinor > 0) earnings.push({ label: "Adjustments", note: null, amountMinor: line.adjustmentsMinor });
  if (line.adjustmentsMinor < 0) deductions.push({ label: "Adjustments", note: null, amountMinor: -line.adjustmentsMinor });
  const total = (rows: BreakdownItem[]) => rows.reduce((sum, row) => sum + row.amountMinor, 0);
  return {
    earnings,
    deductions,
    totalEarningsMinor: total(earnings),
    totalDeductionsMinor: total(deductions),
    attendance: null,
    overtime: null,
  };
}

/** One month's pay: attendance counts, itemised earnings and deductions with the working, then net and paid. */
export function PayslipView({ line, month, showName = true, actions }: PayslipViewProps) {
  const b = line.breakdown ?? fallbackBreakdown(line);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          {showName && <span className="text-body font-semibold text-fg">{line.name}</span>}
          <span className="text-label text-fg-muted">
            {[line.designation && designationLabel(line.designation), month && formatPeriod(month)].filter(Boolean).join(" · ")}
          </span>
        </div>
        {line.status && <StatusBadge status={line.status} />}
      </div>
      {b.attendance && <AttendanceStrip attendance={b.attendance} overtime={b.overtime} />}
      <div className="grid gap-5 md:grid-cols-2">
        <BreakdownList title="Earnings" items={b.earnings} totalLabel="Total earnings" totalMinor={b.totalEarningsMinor} emptyText="No earnings" />
        <BreakdownList
          title="Deductions"
          items={b.deductions}
          totalLabel="Total deductions"
          totalMinor={b.totalDeductionsMinor}
          negative
          emptyText="Nothing deducted this month"
        />
      </div>
      <AmountList
        title="Pay"
        rows={[
          { label: "Net salary", amountMinor: line.netMinor, total: true },
          { label: "Paid so far", amountMinor: line.paidMinor },
          { label: "Still to pay", amountMinor: line.balanceMinor, total: true },
        ]}
      />
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
