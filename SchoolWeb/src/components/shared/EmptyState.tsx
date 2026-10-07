import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon: Icon = Inbox, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}>
      <span className="grid size-12 place-items-center rounded-full bg-selected text-on-selected">
        <Icon className="size-5" />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-body font-medium text-fg">{title}</p>
        {description && <p className="text-label text-fg-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
