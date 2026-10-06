import { cn } from "@/lib/cn";
import type { InboxScope } from "../use-inbox";

const OPTIONS: { id: InboxScope; label: string }[] = [
  { id: "own", label: "Mine" },
  { id: "branch", label: "Branch (read-only)" },
];

export function ScopeToggle({ value, onChange }: { value: InboxScope; onChange: (value: InboxScope) => void }) {
  return (
    <div role="radiogroup" aria-label="Threads to show" className="inline-flex rounded-input border border-border p-0.5">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "h-7 whitespace-nowrap rounded-md px-2.5 text-caption font-medium transition-colors",
            value === option.id ? "bg-primary text-on-primary" : "text-fg-muted hover:text-fg",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
