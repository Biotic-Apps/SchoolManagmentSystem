import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { formatDate, textOrDash } from "@/lib/format";
import { activityAudienceSummary, formatActivityWhen, typeLabel, typeTone } from "./options";
import type { Activity } from "./types";

export function activityColumns(nameOf?: (id: string) => string | undefined): DataTableColumn<Activity>[] {
  return [
    {
      id: "title",
      header: "Title",
      className: "min-w-52 max-w-xs",
      cell: (row) => <span className="block truncate font-medium">{row.title}</span>,
    },
    {
      id: "type",
      header: "Type",
      className: "whitespace-nowrap",
      cell: (row) => <Badge tone={typeTone(row.type)}>{typeLabel(row.type)}</Badge>,
    },
    {
      id: "when",
      header: "When",
      className: "whitespace-nowrap",
      cell: (row) => formatActivityWhen(row.startAt, row.endAt),
    },
    {
      id: "venue",
      header: "Venue",
      className: "min-w-32 max-w-48",
      cell: (row) => <span className="block truncate">{textOrDash(row.venue)}</span>,
    },
    {
      id: "audience",
      header: "Audience",
      className: "min-w-40 max-w-56",
      cell: (row) => <span className="line-clamp-2">{activityAudienceSummary(row.audience, nameOf)}</span>,
    },
    {
      id: "consent",
      header: "Consent",
      className: "whitespace-nowrap",
      cell: (row) =>
        row.consentRequired ? (
          <span className="flex flex-col">
            <span>Required</span>
            {row.consentDeadline && (
              <span className="text-caption text-fg-muted">By {formatDate(row.consentDeadline.slice(0, 10))}</span>
            )}
          </span>
        ) : (
          <span className="text-fg-muted">Not needed</span>
        ),
    },
    { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
  ];
}
