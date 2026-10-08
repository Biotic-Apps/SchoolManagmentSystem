"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/Popover";
import { cn } from "@/lib/cn";
import type { Option } from "./OptionSelect";

interface CreatableComboboxProps {
  /** Accessible name and placeholder, e.g. "Add subject…". */
  label: string;
  options: Option[];
  onPick: (option: Option) => void;
  /** Called with the typed text when nothing matches exactly. */
  onCreate?: (name: string) => void;
  disabled?: boolean;
  className?: string;
}

type Item = { kind: "pick"; option: Option } | { kind: "create"; name: string };

/** Type to filter a list, Enter to pick; offers "Create 'X'" when the text is new. */
export function CreatableCombobox({ label, options, onPick, onCreate, disabled, className }: CreatableComboboxProps) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const items = useMemo<Item[]>(() => {
    const query = text.trim().toLowerCase();
    const matches = options.filter((option) => option.name.toLowerCase().includes(query)).slice(0, 30);
    const list: Item[] = matches.map((option) => ({ kind: "pick", option }));
    const exact = options.some((option) => option.name.toLowerCase() === query);
    if (onCreate && query && !exact) list.push({ kind: "create", name: text.trim() });
    return list;
  }, [options, text, onCreate]);

  const choose = (item: Item | undefined) => {
    if (!item) return;
    if (item.kind === "pick") onPick(item.option);
    else onCreate?.(item.name);
    setText("");
    setActive(0);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActive((value) => (items.length ? (value + delta + items.length) % items.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(items[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const listId = `${label.replace(/\W+/g, "-").toLowerCase()}-list`;

  return (
    <Popover open={open && items.length > 0} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={cn("relative", className)}>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" aria-hidden />
          <Input
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-label={label}
            placeholder={label}
            value={text}
            disabled={disabled}
            onChange={(event) => {
              setText(event.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="h-10 pl-9"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-64 p-1"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          if ((event.target as HTMLElement).closest("[role=combobox]")) event.preventDefault();
        }}
      >
        <ul id={listId} role="listbox" className="flex max-h-64 flex-col overflow-y-auto">
          {items.map((item, index) => (
            <li
              key={item.kind === "pick" ? item.option.id : "__create"}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(item)}
              onMouseEnter={() => setActive(index)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-label text-fg",
                index === active && "bg-selected",
                item.kind === "create" && "font-medium text-primary",
              )}
            >
              {item.kind === "pick" ? (
                item.option.name
              ) : (
                <>
                  <Plus className="size-4" aria-hidden />
                  Create “{item.name}”
                </>
              )}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
