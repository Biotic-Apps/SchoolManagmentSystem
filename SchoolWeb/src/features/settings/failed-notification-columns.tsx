import { RotateCw } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { formatDateTime, formatNumber, humanize, textOrDash } from "@/lib/format";
import { recipientParts } from "./support-format";
import type { FailedNotification } from "./support-types";

interface Options {
  canEdit: boolean;
  onResend: (id: string) => void;
  resendingId?: string;
}

export function failedNotificationColumns({ canEdit, onResend, resendingId }: Options): DataTableColumn<FailedNotification>[] {
  const columns: DataTableColumn<FailedNotification>[] = [
    { id: "at", header: "When", className: "whitespace-nowrap", cell: (row) => formatDateTime(row.at) },
    {
      id: "recipient",
      header: "Recipient",
      className: "min-w-40 max-w-56 break-words",
      cell: (row) => {
        const { name, contact } = recipientParts(row.recipient);
        return (
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            {contact && <span className="text-caption text-fg-muted">{contact}</span>}
          </div>
        );
      },
    },
    { id: "channel", header: "Channel", className: "whitespace-nowrap", cell: (row) => humanize(row.channel) },
    { id: "category", header: "Category", className: "min-w-28", cell: (row) => humanize(row.category) },
    {
      id: "attempts",
      header: "Attempts",
      className: "whitespace-nowrap text-right tabular-nums",
      cell: (row) => formatNumber(row.attempts),
    },
    {
      id: "error",
      header: "Last error",
      className: "min-w-48 max-w-80 whitespace-normal break-words text-fg-muted",
      cell: (row) => textOrDash(row.lastError),
    },
  ];
  if (!canEdit) return columns;
  return [
    ...columns,
    {
      id: "actions",
      header: "",
      className: "w-px text-right",
      cell: (row) => (
        <Button variant="ghost" size="sm" loading={resendingId === row.id} onClick={() => onResend(row.id)}>
          <RotateCw />
          Resend
        </Button>
      ),
    },
  ];
}
