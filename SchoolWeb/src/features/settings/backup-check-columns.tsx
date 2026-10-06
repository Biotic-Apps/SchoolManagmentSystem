import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/cn";
import { formatNumber, textOrDash } from "@/lib/format";
import { isNumeric } from "./backup-format";
import type { BackupCheck } from "./backup-types";

function valueText(value: BackupCheck["expected"]): string {
  if (value === null || value === undefined) return textOrDash(null);
  return isNumeric(value) ? formatNumber(Number(value)) : String(value);
}

function valueCell(value: BackupCheck["expected"]) {
  return <span className={cn("break-words", isNumeric(value) && "block text-right tabular-nums")}>{valueText(value)}</span>;
}

export function backupCheckColumns(): DataTableColumn<BackupCheck>[] {
  return [
    { id: "name", header: "Check", className: "min-w-36 break-words", cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: "expected", header: "Expected", className: "min-w-24 text-right", cell: (row) => valueCell(row.expected) },
    { id: "actual", header: "Actual", className: "min-w-24 text-right", cell: (row) => valueCell(row.actual) },
    {
      id: "ok",
      header: "Result",
      className: "whitespace-nowrap",
      cell: (row) => <StatusBadge status={row.ok ? "OK" : "FAILED"} label={row.ok ? "OK" : "Failed"} />,
    },
  ];
}
