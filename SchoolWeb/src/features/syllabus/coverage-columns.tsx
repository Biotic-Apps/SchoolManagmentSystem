import type { DataTableColumn } from "@/components/shared/DataTable";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { EMPTY_VALUE } from "@/lib/format";
import { coverageTone } from "./options";
import type { CoverageRow } from "./types";

export interface CoverageNames {
  section: (row: CoverageRow) => string | undefined;
  subject: (row: CoverageRow) => string | undefined;
}

export function coverageColumns(names: CoverageNames): DataTableColumn<CoverageRow>[] {
  return [
    { id: "section", header: "Class & section", cell: (row) => names.section(row) ?? EMPTY_VALUE },
    { id: "subject", header: "Subject", cell: (row) => names.subject(row) ?? EMPTY_VALUE },
    {
      id: "completed",
      header: "Completed",
      className: "whitespace-nowrap tabular-nums",
      cell: (row) => `${row.completed} / ${row.total}`,
    },
    {
      id: "delayed",
      header: "Delayed",
      cell: (row) => (row.delayed > 0 ? <Badge tone="warning">{row.delayed} delayed</Badge> : "0"),
    },
    {
      id: "percent",
      header: "Coverage",
      className: "min-w-40",
      cell: (row) => <ProgressBar percent={row.percent} tone={coverageTone(row.percent)} label="Coverage" />,
    },
  ];
}
