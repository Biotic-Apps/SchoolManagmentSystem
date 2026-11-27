import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { HealthAlert } from "@/features/health/types";
import { EMPTY_VALUE } from "@/lib/format";
import { HealthAlertIcon } from "./components/HealthAlertIcon";
import { StatusChips } from "./components/StatusChips";
import type { AttendanceStatus } from "./types";
import type { EditorRow } from "./use-register-editor";

interface RegisterColumnOptions {
  /** Whether this row can be marked (open register, or a student with no mark on a submitted one). */
  isEditable: (row: EditorRow) => boolean;
  alerts: Map<string, HealthAlert>;
  onStatus: (studentId: string, status: AttendanceStatus) => void;
  onRemark: (studentId: string, remark: string) => void;
  /** Submitted / locked registers: open the correction dialog for a marked row. */
  onCorrect?: (row: EditorRow) => void;
}

export function registerColumns({ isEditable, alerts, onStatus, onRemark, onCorrect }: RegisterColumnOptions) {
  const chips = (row: EditorRow) => (
    <StatusChips
      value={row.status}
      onChange={(status) => onStatus(row.studentId, status)}
      disabled={!isEditable(row)}
      label={row.name}
    />
  );
  const remark = (row: EditorRow) =>
    isEditable(row) ? (
      <Input
        aria-label={`Remark for ${row.name}`}
        placeholder="Optional"
        maxLength={200}
        value={row.remark}
        onChange={(event) => onRemark(row.studentId, event.target.value)}
        className="h-9"
      />
    ) : (
      <span className="block max-w-64 truncate text-fg-muted" title={row.remark}>
        {row.remark || EMPTY_VALUE}
      </span>
    );

  // Phones: roll no, status and remark move into the student cell (stacked) so the
  // P / A / L buttons sit under each name instead of off-screen to the right.
  const columns: DataTableColumn<EditorRow>[] = [
    {
      id: "roll",
      header: "Roll no",
      className: "hidden w-20 whitespace-nowrap tabular-nums sm:table-cell",
      cell: (row) => row.rollNo ?? EMPTY_VALUE,
    },
    {
      id: "student",
      header: "Student",
      className: "px-3 sm:min-w-56 sm:px-5",
      cell: (row) => {
        const alert = alerts.get(row.studentId);
        return (
          <div className="flex flex-col gap-2">
            <span className="flex flex-wrap items-center gap-2">
              <PersonCell name={row.name} photoUrl={row.photoUrl} />
              {alert && <HealthAlertIcon alert={alert} />}
              {row.onLeave && <Badge tone="info">On approved leave</Badge>}
            </span>
            <div className="flex flex-col gap-2 sm:hidden">
              {chips(row)}
              {(isEditable(row) || row.remark) && remark(row)}
              {onCorrect && row.entryId && (
                <Button variant="ghost" size="sm" className="self-start" onClick={() => onCorrect(row)}>
                  Request correction
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      className: "hidden whitespace-nowrap sm:table-cell",
      cell: chips,
    },
    {
      id: "remark",
      header: "Remark",
      className: "hidden min-w-48 sm:table-cell",
      cell: remark,
    },
  ];
  if (onCorrect) {
    columns.push({
      id: "actions",
      header: "",
      className: "hidden w-px whitespace-nowrap text-right sm:table-cell",
      cell: (row) =>
        row.entryId ? (
          <Button variant="ghost" size="sm" onClick={() => onCorrect(row)}>
            Request correction
          </Button>
        ) : null,
    });
  }
  return columns;
}
