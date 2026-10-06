import type { DataTableColumn } from "@/components/shared/DataTable";
import { FEE_HEAD_KIND_OPTIONS } from "./structure-options";
import type { FeeHead } from "./types";

export function feeHeadColumns(): DataTableColumn<FeeHead>[] {
  return [
    { id: "code", header: "Code", className: "whitespace-nowrap font-medium", cell: (row) => row.code },
    { id: "name", header: "Name", className: "min-w-40", cell: (row) => row.name },
    {
      id: "kind",
      header: "Kind",
      className: "whitespace-nowrap",
      cell: (row) => FEE_HEAD_KIND_OPTIONS.find((option) => option.id === row.kind)?.name ?? row.kind,
    },
    {
      id: "refundable",
      header: "Refundable",
      className: "whitespace-nowrap",
      cell: (row) => (row.refundable ? "Yes" : "No"),
    },
  ];
}
