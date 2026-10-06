import { CheckCircle2, Pencil } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { EMPTY_VALUE, formatNumber } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { canApprovePlan, monthlyTotalMinor } from "./structure-options";
import type { FeePlan } from "./types";

interface FeePlanHandlers {
  className: (plan: FeePlan) => string;
  canEdit: boolean;
  canApprove: boolean;
  approvingId?: string;
  onEdit: (plan: FeePlan) => void;
  onApprove: (plan: FeePlan) => void;
}

export function feePlanColumns(handlers: FeePlanHandlers): DataTableColumn<FeePlan>[] {
  const { className, canEdit, canApprove, approvingId, onEdit, onApprove } = handlers;
  return [
    { id: "class", header: "Class", className: "whitespace-nowrap font-medium", cell: (row) => className(row) || EMPTY_VALUE },
    { id: "name", header: "Plan", className: "min-w-40", cell: (row) => row.name },
    { id: "items", header: "Fees", className: NUMERIC_COLUMN, cell: (row) => formatNumber(row.items.length) },
    {
      id: "monthly",
      header: "Monthly total",
      className: `${NUMERIC_COLUMN} whitespace-nowrap`,
      cell: (row) => <MoneyText amountMinor={monthlyTotalMinor(row)} />,
    },
    {
      id: "late",
      header: "Late fee",
      className: `${NUMERIC_COLUMN} whitespace-nowrap`,
      cell: (row) =>
        row.lateFee ? (
          <span className="flex flex-col items-end">
            <MoneyText amountMinor={row.lateFee.amountMinor} />
            <span className="text-caption text-fg-muted">after {formatNumber(row.lateFee.afterDays)} days</span>
          </span>
        ) : (
          EMPTY_VALUE
        ),
    },
    { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "actions",
      header: "",
      className: "w-px whitespace-nowrap text-right",
      cell: (row) => (
        <span className="flex justify-end gap-2">
          {canEdit && (
            <Button variant="secondary" size="sm" onClick={() => onEdit(row)}>
              <Pencil />
              Edit
            </Button>
          )}
          {canApprove && canApprovePlan(row) && (
            <Button
              size="sm"
              loading={approvingId === row.id}
              disabled={!!approvingId}
              onClick={() => onApprove(row)}
            >
              <CheckCircle2 />
              Approve
            </Button>
          )}
        </span>
      ),
    },
  ];
}
