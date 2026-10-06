import { BarChart3, Pencil, Pin, Send } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { EMPTY_VALUE, formatDate, formatDateTime } from "@/lib/format";
import { audienceSummary } from "./options";
import type { Notice } from "./types";

interface NoticeRowHandlers {
  canPublish: boolean;
  onEdit: (notice: Notice) => void;
  onPublish: (notice: Notice) => void;
  onReads: (notice: Notice) => void;
  nameOf?: (id: string) => string | undefined;
}

export function noticeColumns({ canPublish, onEdit, onPublish, onReads, nameOf }: NoticeRowHandlers): DataTableColumn<Notice>[] {
  return [
    {
      id: "title",
      header: "Title",
      className: "min-w-56 max-w-sm",
      cell: (row) => (
        <span className="flex min-w-0 items-center gap-2">
          {row.pinned && <Pin className="size-4 shrink-0 text-primary" aria-label="Pinned" />}
          <span className="truncate font-medium">{row.title}</span>
        </span>
      ),
    },
    {
      id: "audience",
      header: "Audience",
      className: "min-w-44 max-w-xs",
      cell: (row) => <span className="line-clamp-2">{audienceSummary(row.audience, nameOf)}</span>,
    },
    { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "published",
      header: "Published",
      className: "whitespace-nowrap",
      cell: (row) => (row.publishedAt ? formatDateTime(row.publishedAt) : EMPTY_VALUE),
    },
    { id: "expires", header: "Expires", className: "whitespace-nowrap", cell: (row) => formatDate(row.expiresOn) },
    {
      id: "reads",
      header: "Reads",
      className: "whitespace-nowrap",
      cell: (row) =>
        row.status === "PUBLISHED" || row.status === "EXPIRED" ? (
          <Button variant="ghost" size="sm" className="-ml-3 text-primary" onClick={(event) => {
            event.stopPropagation();
            onReads(row);
          }}>
            <BarChart3 />
            View reads
          </Button>
        ) : (
          EMPTY_VALUE
        ),
    },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          label={`Actions for ${row.title}`}
          actions={[
            { id: "edit", label: "Edit", icon: Pencil, onSelect: () => onEdit(row), hidden: row.status !== "DRAFT" },
            {
              id: "publish",
              label: "Publish",
              icon: Send,
              onSelect: () => onPublish(row),
              hidden: !canPublish || row.status !== "DRAFT",
            },
            {
              id: "reads",
              label: "Read receipts",
              icon: BarChart3,
              onSelect: () => onReads(row),
              hidden: row.status !== "PUBLISHED" && row.status !== "EXPIRED",
            },
          ]}
        />
      ),
    },
  ];
}
