import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { pageCount, rangeLabel, type PaginationState } from "@/lib/pagination";

export interface TablePaginationProps extends PaginationState {
  onPageChange: (page: number) => void;
}

export function TablePagination({ onPageChange, ...state }: TablePaginationProps) {
  const pages = pageCount(state);
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
      <span className="text-caption text-fg-muted">{rangeLabel(state)}</span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          aria-label="Previous page"
          disabled={state.page <= 1}
          onClick={() => onPageChange(state.page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span className="text-caption text-fg-muted">
          Page {state.page} of {pages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          aria-label="Next page"
          disabled={state.page >= pages}
          onClick={() => onPageChange(state.page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
