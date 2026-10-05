import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface FilterBarProps {
  search?: { value: string; onChange: (value: string) => void; placeholder?: string };
  onReset?: () => void;
  children?: ReactNode;
}

export function FilterBar({ search, onReset, children }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      {search && (
        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
          <Input
            type="search"
            value={search.value}
            placeholder={search.placeholder ?? "Search"}
            onChange={(event) => search.onChange(event.target.value)}
            className="pl-9"
          />
        </div>
      )}
      {children}
      {onReset && (
        <Button variant="ghost" onClick={onReset} className="md:ml-auto">
          Reset filters
        </Button>
      )}
    </div>
  );
}
