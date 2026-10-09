"use client";

import { useState } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";

export interface SearchPickerItem {
  id: string;
  title: string;
  caption?: string | null;
}

interface SearchPickerProps {
  id?: string;
  search: string;
  onSearchChange: (value: string) => void;
  items: SearchPickerItem[];
  selectedId: string | null;
  onSelect: (item: SearchPickerItem) => void;
  loading?: boolean;
  placeholder?: string;
  emptyText?: string;
}

/** Type to search, then pick one record from the results (students, guardians, staff). */
export function SearchPicker({
  id,
  search,
  onSearchChange,
  items,
  selectedId,
  onSelect,
  loading,
  placeholder = "Search",
  emptyText = "No matches",
}: SearchPickerProps) {
  const [picked, setPicked] = useState<SearchPickerItem | null>(null);
  const [browsing, setBrowsing] = useState(false);
  const selected = items.find((item) => item.id === selectedId) ?? (picked?.id === selectedId ? picked : null);

  const pick = (item: SearchPickerItem) => {
    setPicked(item);
    setBrowsing(false);
    onSelect(item);
  };

  if (selected && !browsing) {
    return (
      <div className="flex items-center gap-3 rounded-input border border-primary bg-selected px-3 py-2">
        <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-label font-medium text-fg">{selected.title}</span>
          {selected.caption && <span className="truncate text-caption text-fg-muted">{selected.caption}</span>}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            onSearchChange("");
            setBrowsing(true);
          }}
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
        <Input
          id={id}
          type="search"
          value={search}
          placeholder={placeholder}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-9"
          autoFocus={browsing}
        />
        {loading && <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted" />}
      </div>
      {items.length > 0 && <p className="text-caption text-fg-muted">Click a name to choose it.</p>}
      <ul role="listbox" className="flex max-h-56 flex-col gap-1 overflow-y-auto">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              role="option"
              aria-selected={item.id === selectedId}
              onClick={() => pick(item)}
              className={cn(
                "flex w-full flex-col rounded-input border border-border px-3 py-2 text-left transition-colors",
                "hover:border-primary hover:bg-selected/50",
              )}
            >
              <span className="text-label font-medium text-fg">{item.title}</span>
              {item.caption && <span className="text-caption text-fg-muted">{item.caption}</span>}
            </button>
          </li>
        ))}
        {!loading && items.length === 0 && search.trim() && (
          <li className="px-1 text-caption text-fg-muted">{emptyText}</li>
        )}
      </ul>
    </div>
  );
}
