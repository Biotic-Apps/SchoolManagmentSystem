import { PencilLine } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { EMPTY_VALUE } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { DECISION_LABEL, PROMOTION_STATUS_LABEL } from "./promotion-options";
import type { PromotionRow } from "./types";

function placement(classRef: { name: string } | null, section: { name: string } | null): string {
  if (!classRef && !section) return EMPTY_VALUE;
  return [classRef?.name, section?.name].filter(Boolean).join(" ");
}

export function promotionColumns({ onOverride }: { onOverride?: (row: PromotionRow) => void }) {
  const columns: DataTableColumn<PromotionRow>[] = [
    {
      id: "student",
      header: "Student",
      className: "min-w-48",
      cell: (row) => (
        <span className="flex flex-col">
          <span className="font-medium text-fg">{row.student.name}</span>
          {row.student.admissionNo && <span className="text-caption text-fg-muted">{row.student.admissionNo}</span>}
        </span>
      ),
    },
    {
      id: "from",
      header: "Class & section",
      className: "whitespace-nowrap",
      cell: (row) => placement(row.fromClass, row.fromSection),
    },
    {
      id: "percent",
      header: "Result %",
      className: NUMERIC_COLUMN,
      cell: (row) => (row.percent === null || row.percent === undefined ? EMPTY_VALUE : `${row.percent.toFixed(1)}%`),
    },
    {
      id: "suggested",
      header: "Suggested",
      cell: (row) => <StatusBadge status={row.suggested} label={DECISION_LABEL[row.suggested]} />,
    },
    {
      id: "decision",
      header: "Decision",
      cell: (row) => (
        <span className="flex flex-col gap-1">
          <StatusBadge status={row.decision} label={DECISION_LABEL[row.decision]} />
          {row.decision !== row.suggested && row.reason && (
            <span className="text-caption text-fg-muted">{row.reason}</span>
          )}
        </span>
      ),
    },
    {
      id: "target",
      header: "Moves to",
      className: "whitespace-nowrap",
      cell: (row) => (row.decision === "GRADUATE" ? "Graduates" : placement(row.toClass, row.toSection)),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} label={PROMOTION_STATUS_LABEL[row.status]} />,
    },
  ];
  if (onOverride) {
    columns.push({
      id: "actions",
      header: "",
      className: "w-px whitespace-nowrap text-right",
      cell: (row) =>
        row.status === "SUGGESTED" ? (
          <Button variant="ghost" size="sm" onClick={() => onOverride(row)}>
            <PencilLine />
            Change
          </Button>
        ) : null,
    });
  }
  return columns;
}
