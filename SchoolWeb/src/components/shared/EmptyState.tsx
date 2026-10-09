import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconTile, type IconTileTone } from "./IconTile";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  tone?: IconTileTone;
  className?: string;
}

export function EmptyState({ title, description, icon = Inbox, action, tone = "primary", className }: EmptyStateProps) {
  return (
    <div className={cn("flex animate-fade-in flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}>
      <span className="rounded-[18px] bg-background p-2 ring-1 ring-border/70">
        <IconTile icon={icon} tone={tone} size="lg" />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-body font-medium text-fg">{title}</p>
        {description && <p className="text-label text-fg-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
