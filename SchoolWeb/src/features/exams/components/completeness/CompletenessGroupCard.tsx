import { ProgressBar } from "@/components/shared/ProgressBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { CompletenessGroup } from "../../use-completeness-board";

const percent = (entered: number, total: number) => (total > 0 ? (entered / total) * 100 : 0);

/** One class section: each subject sheet with its status and marks entered. */
export function CompletenessGroupCard({ group }: { group: CompletenessGroup }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{group.title}</CardTitle>
        <ProgressBar percent={percent(group.entered, group.total)} label={`${group.title} marks entered`} />
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col divide-y divide-border">
          {group.cells.map((cell) => (
            <li key={cell.sheetId ?? cell.subjectId ?? cell.subjectName} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-label font-medium text-fg">{cell.subjectName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-caption tabular-nums text-fg-muted">
                    {cell.entered}/{cell.total}
                  </span>
                  <StatusBadge status={cell.status} />
                </div>
              </div>
              <ProgressBar
                percent={percent(cell.entered, cell.total)}
                tone={cell.status === "ACCEPTED" ? "success" : cell.status === "RETURNED" ? "warning" : "primary"}
                label={`${cell.subjectName} marks entered`}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
