import Link from "next/link";
import { Unlink } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AccountBadge } from "@/features/guardians/components/AccountBadge";
import type { GuardianLink } from "@/features/guardians/types";
import { RELATION_OPTIONS, optionName } from "@/features/people/options";

interface GuardianLinkCardProps {
  link: GuardianLink;
  /** Link the name to the guardians screen (staff only). */
  linkName: boolean;
  onRemove?: (link: GuardianLink) => void;
}

export function GuardianLinkCard({ link, linkName, onRemove }: GuardianLinkCardProps) {
  const { guardian } = link;
  const contact = [guardian.phone, guardian.email].filter(Boolean).join(" · ");

  return (
    <li className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2">
          {linkName ? (
            <Link href={`/guardians?open=${guardian.id}`} className="font-medium text-primary hover:underline">
              {guardian.name}
            </Link>
          ) : (
            <span className="font-medium text-fg">{guardian.name}</span>
          )}
          <span className="text-caption text-fg-muted">{optionName(RELATION_OPTIONS, link.relation)}</span>
        </span>
        <span className="text-label text-fg-muted">{contact}</span>
        <span className="flex flex-wrap gap-1">
          {link.isPrimary && <Badge tone="primary">Primary contact</Badge>}
          <StatusBadge status={link.status} />
          <AccountBadge hasAccount={guardian.hasAccount} />
        </span>
      </div>
      {onRemove && (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => onRemove(link)}>
          <Unlink />
          Remove link
        </Button>
      )}
    </li>
  );
}
