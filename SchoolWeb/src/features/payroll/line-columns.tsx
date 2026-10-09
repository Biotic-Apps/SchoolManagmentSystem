import { FileText, Wallet } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { designationLabel } from "@/features/staff/options";
import { cn } from "@/lib/cn";
import { NUMERIC_COLUMN } from "@/lib/table";
import { hoursText } from "./options";
import type { PayrollLine } from "./types";

const MONEY = cn(NUMERIC_COLUMN, "whitespace-nowrap");

const earnings = (row: PayrollLine) => row.breakdown?.totalEarningsMinor ?? row.grossMinor + Math.max(0, row.adjustmentsMinor);
const deductions = (row: PayrollLine) =>
  row.breakdown?.totalDeductionsMinor ?? row.deductionsMinor + row.leaveDeductionMinor + Math.max(0, -row.adjustmentsMinor);

interface LineColumnOptions {
  canPay: boolean;
  onPay: (line: PayrollLine) => void;
  onBreakdown: (line: PayrollLine) => void;
}

/** Run lines: gross, what was added and taken off, net and payment state. */
export function lineColumns({ canPay, onPay, onBreakdown }: LineColumnOptions): DataTableColumn<PayrollLine>[] {
  return [
    {
      id: "staff",
      header: "Staff",
      className: "min-w-48",
      cell: (row) => (
        <span className="flex flex-col">
          <span className="font-medium text-fg">{row.name}</span>
          {row.designation && <span className="text-caption text-fg-muted">{designationLabel(row.designation)}</span>}
        </span>
      ),
    },
    { id: "gross", header: "Gross", className: MONEY, cell: (row) => <MoneyText amountMinor={row.grossMinor} /> },
    {
      id: "overtime",
      header: "Overtime",
      className: MONEY,
      cell: (row) =>
        row.overtimeMinor > 0 ? (
          <span className="flex flex-col items-end">
            <MoneyText amountMinor={row.overtimeMinor} />
            <span className="text-caption text-fg-muted">{hoursText(row.overtimeMinutes)}</span>
          </span>
        ) : (
          <span className="text-fg-muted">—</span>
        ),
    },
    { id: "earnings", header: "Total earnings", className: MONEY, cell: (row) => <MoneyText amountMinor={earnings(row)} /> },
    {
      id: "deductions",
      header: "Deductions",
      className: MONEY,
      cell: (row) => (
        <span className="flex flex-col items-end">
          <MoneyText amountMinor={deductions(row)} className={deductions(row) > 0 ? "text-error" : undefined} />
          {row.unpaidLeaveDays > 0 && <span className="text-caption text-fg-muted">{row.unpaidLeaveDays} unpaid days</span>}
        </span>
      ),
    },
    { id: "net", header: "Net", className: MONEY, cell: (row) => <MoneyText amountMinor={row.netMinor} className="font-semibold" /> },
    { id: "balance", header: "To pay", className: MONEY, cell: (row) => <MoneyText amountMinor={row.balanceMinor} /> },
    { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          label={`Actions for ${row.name}`}
          actions={[
            { id: "breakdown", label: "View breakdown", icon: FileText, onSelect: () => onBreakdown(row) },
            { id: "pay", label: "Record payment", icon: Wallet, onSelect: () => onPay(row), hidden: !canPay || row.balanceMinor <= 0 },
          ]}
        />
      ),
    },
  ];
}
