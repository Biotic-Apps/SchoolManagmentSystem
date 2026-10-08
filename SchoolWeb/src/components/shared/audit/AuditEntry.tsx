import {
  Archive,
  ArchiveRestore,
  BadgeCheck,
  CalendarClock,
  CircleDot,
  CircleX,
  FileUp,
  KeyRound,
  LogIn,
  Megaphone,
  Pencil,
  Plus,
  Settings,
  UserCog,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { AuditKind } from "@/lib/audit/actions";
import type { AuditChange } from "@/lib/audit/diff";
import { formatAuditDateTime } from "@/lib/audit/values";
import { cn } from "@/lib/cn";
import { AuditChanges } from "./AuditChanges";

export interface AuditTimelineEntry {
  id: string;
  action: string;
  title: string;
  kind: AuditKind;
  actorName: string;
  onBehalfOfName?: string | null;
  at: string;
  changes: AuditChange[];
}

const ICONS: Record<AuditKind, LucideIcon> = {
  create: Plus,
  update: Pencil,
  archive: Archive,
  restore: ArchiveRestore,
  people: UserCog,
  schedule: CalendarClock,
  settings: Settings,
  signin: LogIn,
  security: KeyRound,
  money: Wallet,
  approve: BadgeCheck,
  reject: CircleX,
  publish: Megaphone,
  import: FileUp,
  other: CircleDot,
};

const TONES: Partial<Record<AuditKind, string>> = {
  archive: "bg-warning-soft text-warning",
  reject: "bg-error-soft text-error",
  approve: "bg-success-soft text-success",
  restore: "bg-success-soft text-success",
  security: "bg-info-soft text-info",
  signin: "bg-info-soft text-info",
};

export function AuditEntry({ entry }: { entry: AuditTimelineEntry }) {
  const Icon = ICONS[entry.kind] ?? CircleDot;
  return (
    <li className="group/entry relative flex gap-3 pb-5 last:pb-0">
      <span aria-hidden className="absolute bottom-0 left-[13px] top-8 w-px bg-border group-last/entry:hidden" />
      <span
        aria-hidden
        className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", TONES[entry.kind] ?? "bg-selected text-on-selected")}
      >
        <Icon className="size-3.5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
        <div className="flex flex-col">
          <p className="text-label font-medium text-fg">{entry.title}</p>
          <p className="text-caption text-fg-muted">
            by {entry.actorName}
            {entry.onBehalfOfName && <> on behalf of {entry.onBehalfOfName}</>}
            {" · "}
            <time dateTime={entry.at}>{formatAuditDateTime(entry.at)}</time>
          </p>
        </div>
        <AuditChanges changes={entry.changes} />
      </div>
    </li>
  );
}
