import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import type { ApprovalRequest } from "@/features/approvals/types";
import { formatDateTime } from "@/lib/format";

export function changeRequestColumns(): DataTableColumn<ApprovalRequest>[] {
  return [
    {
      id: "title",
      header: "Request",
      className: "min-w-56",
      cell: (row) => <span className="font-medium">{row.title}</span>,
    },
    { id: "requestedBy", header: "Requested by", className: "min-w-40", cell: (row) => row.requestedBy.name },
    { id: "created", header: "Sent", className: "whitespace-nowrap", cell: (row) => formatDateTime(row.createdAt) },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "open",
      header: "",
      className: "w-px whitespace-nowrap text-right",
      cell: () => (
        <Button asChild variant="ghost" size="sm">
          <Link href="/approvals">
            Review in Approvals
            <ArrowRight />
          </Link>
        </Button>
      ),
    },
  ];
}
