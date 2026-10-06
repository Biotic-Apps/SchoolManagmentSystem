import { FileText, Wallet } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { designationLabel } from "@/features/staff/options";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import type { PayrollLine } from "./types";

const MONEY = cn(NUMERIC_COLUMN, "whitespace-nowrap");

type MoneyKey =
  | "basicMinor"
  | "allowancesMinor"
  | "deductionsMinor"
  | "leaveDeductionMinor"
  | "adjustmentsMinor"
  | "netMinor"
  | "paidMinor"
  | "balanceMinor";

const money = (id: MoneyKey, header: string): DataTableColumn<PayrollLine> => ({
  id,
  header,
  className: MONEY,
  cell: (row) => <MoneyText amountMinor={row[id]} />,
});

interface LineColumnOptions {
  canPay: boolean;
  hasPayslips: boolean;
  onPay: (line: PayrollLine) => void;
  onPayslip: (line: PayrollLine) => void;
}

export function lineColumns({ canPay, hasPayslips, onPay, onPayslip }: LineColumnOptions): DataTableColumn<PayrollLine>[] {
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
    money("basicMinor", "Basic"),
    money("allowancesMinor", "Allowances"),
    money("deductionsMinor", "Deductions"),
    { id: "unpaidLeaveDays", header: "Unpaid leave days", className: NUMERIC_COLUMN, cell: (row) => formatNumber(row.unpaidLeaveDays) },
    money("leaveDeductionMinor", "Leave deduction"),
    money("adjustmentsMinor", "Adjustments"),
    { ...money("netMinor", "Net"), cell: (row) => <MoneyText amountMinor={row.netMinor} className="font-semibold" /> },
    money("paidMinor", "Paid"),
    money("balanceMinor", "Balance"),
    { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          label={`Actions for ${row.name}`}
          actions={[
            { id: "payslip", label: "View payslip", icon: FileText, onSelect: () => onPayslip(row), hidden: !hasPayslips },
            { id: "pay", label: "Record payment", icon: Wallet, onSelect: () => onPay(row), hidden: !canPay || row.balanceMinor <= 0 },
          ]}
        />
      ),
    },
  ];
}
