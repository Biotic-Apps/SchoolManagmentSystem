import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { IMPORT_KINDS } from "../../import-kinds";
import type { ImportKind } from "../../import-types";

interface ImportKindSelectProps {
  value: ImportKind;
  onChange: (kind: ImportKind) => void;
  disabled?: boolean;
}

export function ImportKindSelect({ value, onChange, disabled }: ImportKindSelectProps) {
  return (
    <div role="radiogroup" aria-label="What to import" className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {IMPORT_KINDS.map((kind) => {
        const selected = kind.id === value;
        return (
          <button
            key={kind.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(kind.id)}
            className={cn(
              "flex flex-col gap-1 rounded-input border p-3 text-left transition-colors disabled:opacity-60",
              focusRing,
              selected ? "border-primary bg-selected" : "border-border bg-surface hover:bg-selected/60",
            )}
          >
            <span className="text-label font-semibold text-fg">{kind.label}</span>
            <span className="text-caption text-fg-muted">{kind.description}</span>
          </button>
        );
      })}
    </div>
  );
}
