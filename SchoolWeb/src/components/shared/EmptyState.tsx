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
    <div className={cn("flex animate-fade-in flex-col items-center justify-center gap-4 px-6 py-16 text-center", className)}>
      <div className="rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/10">
        <IconTile icon={icon} tone={tone} size="lg" />
      </div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <p className="text-body font-semibold text-fg">{title}</p>
        {description && <p className="text-label leading-relaxed text-fg-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
