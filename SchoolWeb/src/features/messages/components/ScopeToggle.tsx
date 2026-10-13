import { Building2, User } from "lucide-react";
import { cn } from "@/lib/cn";
import type { InboxScope } from "../use-inbox";

const OPTIONS: { id: InboxScope; label: string; icon: typeof User }[] = [
  { id: "own", label: "Mine", icon: User },
  { id: "branch", label: "Branch (read-only)", icon: Building2 },
];

export function ScopeToggle({ value, onChange }: { value: InboxScope; onChange: (value: InboxScope) => void }) {
  return (
    <div role="radiogroup" aria-label="Threads to show" className="inline-flex rounded-input border border-border p-0.5">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-md px-2.5 text-caption font-medium transition-colors",
              active
                ? "bg-primary text-on-primary shadow-sm"
                : "text-fg-muted hover:bg-selected/50 hover:text-fg",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
