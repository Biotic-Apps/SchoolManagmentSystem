import { Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { textOrDash } from "@/lib/format";
import type { ParticipantRow, ParticipantsEditor } from "./use-participants-editor";

type Field = "role" | "result" | "position" | "remarks";

const FIELDS: { id: Field; header: string; className: string; placeholder: string }[] = [
  { id: "role", header: "Role", className: "min-w-32", placeholder: "e.g. Captain" },
  { id: "result", header: "Result", className: "min-w-32", placeholder: "e.g. Winner" },
  { id: "position", header: "Position", className: "w-24", placeholder: "1" },
  { id: "remarks", header: "Remarks", className: "min-w-40", placeholder: "" },
];

export function participantColumns(editor: ParticipantsEditor, editable: boolean): DataTableColumn<ParticipantRow>[] {
  const fields: DataTableColumn<ParticipantRow>[] = FIELDS.map((field) => ({
    id: field.id,
    header: field.header,
    className: field.className,
    cell: (row) =>
      editable ? (
        <Input
          aria-label={`${field.header} for ${row.name}`}
          value={row[field.id]}
          placeholder={field.placeholder}
          inputMode={field.id === "position" ? "numeric" : undefined}
          onChange={(event) => editor.setField(row.studentId, field.id, event.target.value)}
        />
      ) : (
        textOrDash(row[field.id])
      ),
  }));

  return [
    {
      id: "student",
      header: "Student",
      className: "min-w-40",
      cell: (row) => <span className="block truncate font-medium">{row.name}</span>,
    },
    ...fields,
    ...(editable
      ? [
          {
            id: "remove",
            header: "",
            className: "w-12",
            cell: (row: ParticipantRow) => (
              <Button variant="ghost" size="sm" aria-label={`Remove ${row.name}`} onClick={() => editor.remove(row.studentId)}>
                <Trash2 />
              </Button>
            ),
          },
        ]
      : []),
  ];
}
