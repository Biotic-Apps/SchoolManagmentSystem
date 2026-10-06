import { CornerUpLeft, Send } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import type { DiaryEntry } from "./types";

interface ModerationHandlers {
  publishingId?: string;
  onPublish: (entry: DiaryEntry) => void;
  onReturn: (entry: DiaryEntry) => void;
}

export function moderationColumns({ publishingId, onPublish, onReturn }: ModerationHandlers): DataTableColumn<DiaryEntry>[] {
  return [
    { id: "date", header: "Date", className: "whitespace-nowrap", cell: (row) => formatDate(row.date) },
    {
      id: "section",
      header: "Class & section",
      className: "whitespace-nowrap",
      cell: (row) => `${row.className} ${row.sectionName}`,
    },
    { id: "subject", header: "Subject", className: "whitespace-nowrap", cell: (row) => row.subject.name },
    {
      id: "topics",
      header: "Topics",
      className: "min-w-56 max-w-md",
      cell: (row) => <span className="line-clamp-2 whitespace-pre-line">{row.topics}</span>,
    },
    {
      id: "author",
      header: "Teacher",
      className: "min-w-44",
      cell: (row) => (
        <PersonCell name={row.author.name} caption={row.onBehalfOf ? `For ${row.onBehalfOf.name}` : null} />
      ),
    },
    {
      id: "actions",
      header: "",
      className: "w-px whitespace-nowrap text-right",
      cell: (row) => (
        <span className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => onReturn(row)} disabled={!!publishingId}>
            <CornerUpLeft />
            Return
          </Button>
          <Button size="sm" loading={publishingId === row.id} disabled={!!publishingId} onClick={() => onPublish(row)}>
            <Send />
            Publish
          </Button>
        </span>
      ),
    },
  ];
}
