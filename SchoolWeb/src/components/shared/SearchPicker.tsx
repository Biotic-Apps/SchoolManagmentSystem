"use client";

import { Search } from "lucide-react";
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
        />
        {loading && <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted" />}
      </div>
      <ul role="listbox" className="flex max-h-56 flex-col gap-1 overflow-y-auto">
        {items.map((item) => {
          const selected = item.id === selectedId;
          return (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(item)}
                className={cn(
                  "flex w-full flex-col rounded-input border px-3 py-2 text-left transition-colors",
                  selected ? "border-primary bg-selected" : "border-border hover:bg-selected/50",
                )}
              >
                <span className="text-label font-medium text-fg">{item.title}</span>
                {item.caption && <span className="text-caption text-fg-muted">{item.caption}</span>}
              </button>
            </li>
          );
        })}
        {!loading && items.length === 0 && search.trim() && (
          <li className="px-1 text-caption text-fg-muted">{emptyText}</li>
        )}
      </ul>
    </div>
  );
}
