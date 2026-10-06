import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { Badge } from "@/components/ui/Badge";
import { EMPTY_VALUE } from "@/lib/format";
import { HomeworkStatusChips } from "./components/HomeworkStatusChips";
import type { HomeworkStatus } from "./types";
import type { HomeworkRow } from "./use-homework-editor";

interface HomeworkColumnOptions {
  editable: boolean;
  onStatus: (studentId: string, status: HomeworkStatus) => void;
}

export function homeworkColumns({ editable, onStatus }: HomeworkColumnOptions): DataTableColumn<HomeworkRow>[] {
  return [
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
      cell: (row) => (
        <span className="flex items-center gap-2">
          <PersonCell name={row.name} photoUrl={row.photoUrl} />
          {row.changed && <Badge tone="warning">Unsaved</Badge>}
        </span>
      ),
    },
    {
      id: "status",
      header: "Homework",
      className: "whitespace-nowrap",
      cell: (row) => (
        <HomeworkStatusChips
          value={row.status}
          onChange={(status) => onStatus(row.id, status)}
          disabled={!editable}
          label={row.name}
        />
      ),
    },
  ];
}
