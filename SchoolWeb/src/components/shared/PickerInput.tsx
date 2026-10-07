"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode, type Ref } from "react";
import type { LucideIcon } from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/Popover";
import { fieldBase } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

export interface PickerInputBaseProps {
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
  onBlur?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  /** Accessible name when there is no visible label. */
  ariaLabel?: string;
  placeholder?: string;
  size?: "md" | "sm";
  className?: string;
}

interface PickerInputProps extends PickerInputBaseProps {
  text: string;
  onTextChange: (text: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** Called on blur, before onBlur: drops half-typed text. */
  onCommit: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  iconLabel: string;
  panelLabel: string;
  /** Panel content; closing it (onOpenChange(false)) returns focus to the field. */
  children: ReactNode;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T }).current = value;
}

/**
 * Typeable field with a popover panel (clock, calendar). Focus stays in the field while the
 * panel is open, so typing still works; clicking the field or its icon opens the panel.
 */
export function PickerInput({
  text,
  onTextChange,
  onKeyDown,
  onCommit,
  open,
  onOpenChange,
  icon: Icon,
  iconLabel,
  panelLabel,
  children,
  id,
  inputRef,
  onBlur,
  disabled,
  invalid,
  describedBy,
  ariaLabel,
  placeholder,
  size = "md",
  className,
}: PickerInputProps) {
  const anchor = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const panelId = useId();

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <div ref={anchor} className={cn("relative", className)}>
          <input
            ref={(element) => {
              input.current = element;
              assignRef(inputRef, element);
            }}
            id={id}
            type="text"
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-expanded={open}
            aria-controls={panelId}
            aria-haspopup="dialog"
            aria-label={ariaLabel}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            disabled={disabled}
            placeholder={placeholder}
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            onKeyDown={onKeyDown}
            onClick={() => !disabled && onOpenChange(true)}
            onBlur={() => {
              onCommit();
              onBlur?.();
            }}
            className={cn(fieldBase, "pr-10 tabular-nums", size === "sm" ? "h-9 text-label" : "h-11")}
          />
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            aria-label={iconLabel}
            onClick={() => onOpenChange(!open)}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-fg-muted hover:text-primary disabled:opacity-60"
          >
            <Icon className="size-4" />
          </button>
        </div>
      </PopoverAnchor>
      <PopoverContent
        id={panelId}
        aria-label={panelLabel}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          // Back to the field after picking, unless the user already moved on to another one.
          const active = document.activeElement;
          if (!active || active === document.body || !document.contains(active)) input.current?.focus();
        }}
        onInteractOutside={(event) => {
          // Clicks on the field itself keep the panel open.
          if (anchor.current?.contains(event.target as Node)) event.preventDefault();
        }}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
