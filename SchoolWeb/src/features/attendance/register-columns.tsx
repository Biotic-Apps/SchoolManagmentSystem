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
  editable: boolean;
  alerts: Map<string, HealthAlert>;
  onStatus: (studentId: string, status: AttendanceStatus) => void;
  onRemark: (studentId: string, remark: string) => void;
  /** Locked registers: open the correction dialog for a row. */
  onCorrect?: (row: EditorRow) => void;
}

export function registerColumns({ editable, alerts, onStatus, onRemark, onCorrect }: RegisterColumnOptions) {
  const columns: DataTableColumn<EditorRow>[] = [
    {
      id: "roll",
      header: "Roll no",
      className: "w-20 whitespace-nowrap tabular-nums",
      cell: (row) => row.rollNo ?? EMPTY_VALUE,
    },
    {
      id: "student",
      header: "Student",
      className: "min-w-56",
      cell: (row) => {
        const alert = alerts.get(row.studentId);
        return (
          <span className="flex items-center gap-2">
            <PersonCell name={row.name} photoUrl={row.photoUrl} />
            {alert && <HealthAlertIcon alert={alert} />}
            {row.onLeave && <Badge tone="info">On approved leave</Badge>}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      className: "whitespace-nowrap",
      cell: (row) => (
        <StatusChips
          value={row.status}
          onChange={(status) => onStatus(row.studentId, status)}
          disabled={!editable}
          label={row.name}
        />
      ),
    },
    {
      id: "remark",
      header: "Remark",
      className: "min-w-48",
      cell: (row) =>
        editable ? (
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
        ),
    },
  ];
  if (onCorrect) {
    columns.push({
      id: "actions",
      header: "",
      className: "w-px whitespace-nowrap text-right",
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
