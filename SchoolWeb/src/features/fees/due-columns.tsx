import { BookOpenText, Wallet } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { RowActions } from "@/components/shared/RowActions";
import { Checkbox } from "@/components/ui/Checkbox";
import { formatNumber } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import type { DueRow } from "./types";

interface DueColumnHandlers {
  selectable: boolean;
  isSelected: (studentId: string) => boolean;
  onToggle: (studentId: string) => void;
  onLedger: (row: DueRow) => void;
  onPayment?: (row: DueRow) => void;
}

function classLabel(row: DueRow): string {
  return [row.student.className, row.student.sectionName].filter(Boolean).join(" ");
}

export function dueColumns({ selectable, isSelected, onToggle, onLedger, onPayment }: DueColumnHandlers): DataTableColumn<DueRow>[] {
  const select: DataTableColumn<DueRow> = {
    id: "select",
    header: "",
    className: "w-10",
    cell: (row) => (
      <Checkbox
        aria-label={`Select ${row.student.name}`}
        checked={isSelected(row.student.id)}
        onCheckedChange={() => onToggle(row.student.id)}
      />
    ),
  };
  const money = (id: string, header: string, pick: (row: DueRow) => number | undefined): DataTableColumn<DueRow> => ({
    id,
    header,
    className: NUMERIC_COLUMN,
    cell: (row) => <MoneyText amountMinor={pick(row) ?? 0} />,
  });

  return [
    ...(selectable ? [select] : []),
    {
      id: "student",
      header: "Student",
      className: "min-w-44",
      cell: (row) => (
        <span className="flex flex-col">
          <span className="font-medium">{row.student.name}</span>
          <span className="text-caption text-fg-muted">{[row.student.admissionNo, classLabel(row)].filter(Boolean).join(" · ")}</span>
        </span>
      ),
    },
    { id: "days", header: "Days overdue", className: NUMERIC_COLUMN, cell: (row) => formatNumber(row.days) },
    money("d0_30", "0–30 days", (row) => row.buckets?.d0_30),
    money("d31_60", "31–60 days", (row) => row.buckets?.d31_60),
    money("d61_90", "61–90 days", (row) => row.buckets?.d61_90),
    money("d90plus", "90+ days", (row) => row.buckets?.d90plus),
    { ...money("total", "Total balance", (row) => row.balanceMinor), className: `${NUMERIC_COLUMN} font-semibold` },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          label={`Actions for ${row.student.name}`}
          actions={[
            { id: "ledger", label: "Ledger", icon: BookOpenText, onSelect: () => onLedger(row) },
            { id: "payment", label: "Record payment", icon: Wallet, onSelect: () => onPayment?.(row), hidden: !onPayment },
          ]}
        />
      ),
    },
  ];
}
