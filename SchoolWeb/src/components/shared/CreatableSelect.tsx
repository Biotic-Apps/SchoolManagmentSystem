"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { cn } from "@/lib/cn";
import { errorMessage } from "@/lib/error-messages";
import type { Option } from "./OptionSelect";
import type { HintedOption } from "./select-option";

const NONE = "__none";
const CREATE = "__create";

interface CreatableSelectProps {
  id?: string;
  /** Accessible name of the select. */
  label: string;
  options: HintedOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  /** First item that clears the value, e.g. "No room". */
  emptyLabel?: string;
  /** Last item, e.g. "New room"; picking it shows a name field in place. */
  createLabel?: string;
  onCreate?: (name: string) => Promise<Option>;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

/** Select that can also add a new entry inline ("+ New room") without leaving the screen. */
export function CreatableSelect({
  id,
  label,
  options,
  value,
  onChange,
  emptyLabel,
  createLabel,
  onCreate,
  placeholder = "Select",
  disabled,
  invalid,
  className,
}: CreatableSelectProps) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = () => {
    setCreating(false);
    setName("");
    setError(null);
  };

  const create = async () => {
    if (!onCreate || !name.trim()) return setError("Type a name first");
    setBusy(true);
    setError(null);
    try {
      const created = await onCreate(name.trim());
      onChange(created.id);
      cancel();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  };

  if (creating) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <div className="flex items-center gap-1">
          <Input
            id={id}
            autoFocus
            value={name}
            aria-label={createLabel ?? "Name"}
            placeholder={createLabel ? `${createLabel} name` : "Name"}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void create();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                cancel();
              }
            }}
            className="h-10 min-w-0 flex-1"
          />
          <Button size="sm" className="h-10" onClick={() => void create()} loading={busy}>
            Add
          </Button>
          <Button variant="ghost" size="sm" className="h-10 px-2" onClick={cancel} aria-label="Cancel" disabled={busy}>
            <X />
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-caption text-error">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <Select
      value={value ?? (emptyLabel ? NONE : "")}
      onValueChange={(next) => {
        if (next === CREATE) return setCreating(true);
        onChange(next === NONE ? null : next);
      }}
      disabled={disabled}
    >
      <SelectTrigger id={id} aria-label={label} aria-invalid={invalid || undefined} className={cn("h-10", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {emptyLabel && <SelectItem value={NONE}>{emptyLabel}</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id} hint={option.hint} className={cn(option.muted && "text-fg-muted")}>
            {option.name}
          </SelectItem>
        ))}
        {createLabel && onCreate && (
          <>
            <SelectSeparator />
            <SelectItem value={CREATE} className="font-medium text-primary">
              <span className="inline-flex items-center gap-1.5">
                <Plus className="size-4" aria-hidden />
                {createLabel}
              </span>
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
}
