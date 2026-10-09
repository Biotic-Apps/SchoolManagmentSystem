import Link from "next/link";
import { Unlink } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AccountBadge } from "@/features/guardians/components/AccountBadge";
import { GuardianSignInPanel } from "@/features/guardians/components/GuardianSignInPanel";
import type { GuardianLink, SlipChild } from "@/features/guardians/types";
import { RELATION_OPTIONS, optionName } from "@/features/people/options";

interface GuardianLinkCardProps {
  link: GuardianLink;
  /** Link the name to the guardians screen and show parent sign-in (staff only). */
  linkName: boolean;
  /** This student, printed on a login slip. */
  child: SlipChild;
  onRemove?: (link: GuardianLink) => void;
}

export function GuardianLinkCard({ link, linkName, child, onRemove }: GuardianLinkCardProps) {
  const { guardian } = link;
  const contact = [guardian.phone, guardian.email].filter(Boolean).join(" · ");

  return (
    <li className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
      </div>
      {linkName && <GuardianSignInPanel guardian={guardian} child={child} />}
    </li>
  );
}
