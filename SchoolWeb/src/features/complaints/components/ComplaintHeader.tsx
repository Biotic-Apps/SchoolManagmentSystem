import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { escalationLabel } from "../status";
import type { Complaint } from "../types";

export function ComplaintHeader({ complaint }: { complaint: Complaint }) {
  const escalation = escalationLabel(complaint.escalationLevel);
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="font-medium tabular-nums">{complaint.ticketNo}</span>
      <StatusBadge status={complaint.status} />
      {complaint.overdue && <Badge tone="error">Overdue</Badge>}
      {escalation && <Badge tone="warning">{escalation}</Badge>}
    </span>
  );
}
