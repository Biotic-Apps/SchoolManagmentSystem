import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
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
  loading?: boolean;
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
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  loading,
  error,
  onRetry,
  onRowClick,
  skeletonRows = 5,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  pagination,
  stickyHeader,
}: DataTableProps<T>) {
  const failed = !loading && !!error;
  const isEmpty = !loading && !failed && (!rows || rows.length === 0);

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      <Table wrapperClassName={cn(stickyHeader && "max-h-[calc(100dvh-16rem)] min-h-40 overflow-y-auto")}>
        <TableHeader className={cn(stickyHeader && "sticky top-0 z-10 shadow-[inset_0_-1px_0_var(--border)]")}>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column.id} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading &&
            Array.from({ length: skeletonRows }, (_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton className="h-4 w-3/4" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!loading &&
            !failed &&
            rows?.map((row) => (
              <TableRow
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {columns.map((column) => (
                  <TableCell key={column.id} className={cn(column.className)}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {failed && <ErrorState error={error} onRetry={onRetry} />}
      {isEmpty && <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />}
      {pagination && !isEmpty && !failed && <TablePagination {...pagination} />}
    </div>
  );
}
