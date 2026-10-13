"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface NavSearchProps {
  value: string;
  onChange: (value: string) => void;
  /** Called on Enter, e.g. to open the first match. */
  onSubmit: () => void;
}

/** Menu filter at the top of the sidebar; Ctrl/⌘+K focuses it. */
export function NavSearch({ value, onChange, onSubmit }: NavSearchProps) {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative mb-2">
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
      />
      <input
        ref={input}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSubmit();
          if (event.key === "Escape") onChange("");
        }}
        placeholder="Search menu…"
        aria-label="Search menu"
        className={cn(
          "h-9 w-full rounded-full border border-border/60 bg-background/60 pl-9 pr-14 text-label text-fg placeholder:text-fg-muted/60",
          "outline-none transition-all duration-200 focus:border-primary/40 focus:bg-surface focus:shadow-sm [&::-webkit-search-cancel-button]:hidden",
        )}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-fg-muted hover:text-fg"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 text-[10px] text-fg-muted">
          Ctrl K
        </kbd>
      )}
    </div>
  );
}
