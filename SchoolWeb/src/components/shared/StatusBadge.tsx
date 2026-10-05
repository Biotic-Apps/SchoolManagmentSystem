import { Badge } from "@/components/ui/Badge";
import { humanize } from "@/lib/format";
import { statusTone } from "@/lib/status-tone";

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return <Badge tone={statusTone(status)}>{label ?? humanize(status)}</Badge>;
}
