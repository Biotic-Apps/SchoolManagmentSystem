import type { DataTableColumn } from "@/components/shared/DataTable";
import { textOrDash } from "@/lib/format";
import type { ExpenseCategory, Vendor } from "./types";

export function vendorColumns(): DataTableColumn<Vendor>[] {
  return [
    { id: "name", header: "Vendor", className: "min-w-40", cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: "contact", header: "Contact person", className: "min-w-32", cell: (row) => textOrDash(row.contactPerson) },
    { id: "phone", header: "Phone", className: "whitespace-nowrap", cell: (row) => textOrDash(row.phone) },
    { id: "email", header: "Email", className: "min-w-40", cell: (row) => textOrDash(row.email) },
    { id: "ntn", header: "NTN", className: "whitespace-nowrap tabular-nums", cell: (row) => textOrDash(row.ntn) },
  ];
}

export function categoryColumns(): DataTableColumn<ExpenseCategory>[] {
  return [
    { id: "name", header: "Category", className: "min-w-40", cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: "code", header: "Code", className: "whitespace-nowrap", cell: (row) => textOrDash(row.code) },
  ];
}
