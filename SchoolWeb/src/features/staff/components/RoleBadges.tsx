import { Badge } from "@/components/ui/Badge";
import { roleLabel } from "@/config/roles";
import { EMPTY_VALUE } from "@/lib/format";

export function RoleBadges({ roles }: { roles: string[] }) {
  if (roles.length === 0) return <span className="text-fg-muted">{EMPTY_VALUE}</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <Badge key={role} tone="primary">
          {roleLabel(role)}
        </Badge>
      ))}
    </span>
  );
}
