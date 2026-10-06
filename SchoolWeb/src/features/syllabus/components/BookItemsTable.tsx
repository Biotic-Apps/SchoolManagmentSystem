import { DataTable } from "@/components/shared/DataTable";
import { bookItemColumns } from "../book-item-columns";
import type { BookItem } from "../types";

const COLUMNS = bookItemColumns();

interface BookItemsTableProps {
  items: BookItem[] | undefined;
  loading?: boolean;
}

export function BookItemsTable({ items, loading }: BookItemsTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={items}
      getRowId={(row) => row.id ?? `${row.title}-${row.isbn ?? ""}-${row.subjectId ?? ""}`}
      loading={loading}
      emptyTitle="No books in this list"
    />
  );
}
