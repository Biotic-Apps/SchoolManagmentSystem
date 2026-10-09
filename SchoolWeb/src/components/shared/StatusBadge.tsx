import { Badge } from "@/components/ui/Badge";
import { humanize } from "@/lib/format";
import { statusTone } from "@/lib/status-tone";

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <Badge tone={statusTone(status)} dot>
      {label ?? humanize(status)}
    </Badge>
  );
}
