import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NUMERIC_COLUMN } from "@/lib/table";
import { formatPeriod } from "@/lib/period";
import type { Concession } from "./types";

function ConcessionValue({ concession }: { concession: Concession }) {
  if (concession.type === "PERCENT") return <span className="tabular-nums">{concession.value}%</span>;
  return <MoneyText amountMinor={concession.value} />;
}

function monthsLabel(concession: Concession): string {
  const from = formatPeriod(concession.from);
  return concession.to ? `${from} – ${formatPeriod(concession.to)}` : `From ${from}`;
}

export function concessionColumns(): DataTableColumn<Concession>[] {
  return [
    { id: "student", header: "Student", className: "min-w-40", cell: (row) => row.student?.name },
    { id: "head", header: "Fee head", className: "min-w-32", cell: (row) => row.feeHead?.name ?? "All heads" },
    { id: "value", header: "Concession", className: NUMERIC_COLUMN, cell: (row) => <ConcessionValue concession={row} /> },
    { id: "months", header: "Months", className: "min-w-44", cell: monthsLabel },
    { id: "reason", header: "Reason", className: "min-w-48", cell: (row) => row.reason },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];
}
