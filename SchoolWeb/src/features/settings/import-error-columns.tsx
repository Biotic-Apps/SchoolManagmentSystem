import type { DataTableColumn } from "@/components/shared/DataTable";
import { EMPTY_VALUE, formatNumber } from "@/lib/format";
import type { ImportRowError } from "./import-types";

export type KeyedImportError = ImportRowError & { key: string };

export const importErrorColumns: DataTableColumn<KeyedImportError>[] = [
  {
    id: "row",
    header: "Row",
    className: "w-20 text-right tabular-nums",
    cell: (error) => formatNumber(error.row),
  },
  {
    id: "column",
    header: "Column",
    className: "w-40 break-words",
    cell: (error) => error.column || EMPTY_VALUE,
  },
  {
    id: "message",
    header: "Message",
    className: "min-w-64 whitespace-normal break-words",
    cell: (error) => error.message,
  },
];
