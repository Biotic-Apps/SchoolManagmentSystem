import type { AnimationEvent, KeyboardEvent, ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { cardSurface } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { clearFlashedRow, useFlashedRow } from "@/lib/row-highlight";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { TablePagination, type TablePaginationProps } from "./TablePagination";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[] | undefined;
  getRowId: (row: T) => string;
  /** First load only (no rows yet) — shows skeleton rows. Pass `query.isLoading`, not `isFetching`. */
  loading?: boolean;
  /** A refetch with rows already on screen (e.g. `query.isFetching`) — rows stay put and dim slightly. */
  refreshing?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  pagination?: TablePaginationProps;
  /** Keeps the header row visible while the rows scroll (the table scrolls inside a viewport-high box). */
  stickyHeader?: boolean;
  /** Briefly tints this row (e.g. just saved). Rows flashed through lib/row-highlight are tinted too. */
  highlightRowId?: string | null;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  loading,
  refreshing,
  error,
  onRetry,
  onRowClick,
  skeletonRows = 5,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  pagination,
  stickyHeader,
  highlightRowId,
}: DataTableProps<T>) {
  const flashedId = useFlashedRow();
  // Skeletons only while there is nothing to show; a refetch keeps the current rows on screen.
  const initialLoad = !!loading && !rows?.length;
  const failed = !initialLoad && !!error;
  const isEmpty = !initialLoad && !failed && (!rows || rows.length === 0);
  const dimmed = !initialLoad && !!rows?.length && (!!refreshing || !!loading);

  const rowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: T) => {
    if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onRowClick?.(row);
  };

  const flashEnded = (event: AnimationEvent<HTMLTableRowElement>, id: string) => {
    if (event.target === event.currentTarget && event.animationName === "row-flash") clearFlashedRow(id);
  };

  return (
    <div className={cn(cardSurface, "overflow-hidden")}>
      <Table
        aria-busy={initialLoad || dimmed || undefined}
        wrapperClassName={cn(stickyHeader && "max-h-[calc(100dvh-16rem)] min-h-40 overflow-y-auto")}
      >
        <TableHeader className={cn(stickyHeader && "sticky top-0 z-10 shadow-[inset_0_-1px_0_var(--border)]")}>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column.id} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody
          className={cn(
            "transition-opacity duration-(--dur-quick) ease-standard",
            dimmed && "opacity-60 delay-150",
          )}
        >
          {initialLoad &&
            Array.from({ length: skeletonRows }, (_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton className="h-4 w-3/4 max-w-48" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!initialLoad &&
            !failed &&
            rows?.map((row) => {
              const id = getRowId(row);
              const flashing = id === highlightRowId || id === flashedId;
              return (
                <TableRow
                  key={id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={onRowClick ? (event) => rowKeyDown(event, row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onAnimationEnd={id === flashedId ? (event) => flashEnded(event, id) : undefined}
                  className={cn(
                    onRowClick &&
                      "cursor-pointer hover:bg-selected/60 active:bg-selected focus-visible:bg-selected/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
                    flashing && "animate-row-flash",
                  )}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} className={cn(column.className)}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      {failed && <ErrorState error={error} onRetry={onRetry} />}
      {isEmpty && <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />}
      {pagination && !isEmpty && !failed && <TablePagination {...pagination} />}
    </div>
  );
}
