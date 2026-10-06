import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { Badge } from "@/components/ui/Badge";
import { textOrDash } from "@/lib/format";
import type { BookItem } from "./types";

export function bookItemColumns(): DataTableColumn<BookItem>[] {
  return [
    { id: "title", header: "Title", cell: (row) => <span className="font-medium">{row.title}</span> },
    { id: "subject", header: "Subject", cell: (row) => textOrDash(row.subjectName) },
    { id: "author", header: "Author", cell: (row) => textOrDash(row.author) },
    { id: "publisher", header: "Publisher", cell: (row) => textOrDash(row.publisher) },
    { id: "isbn", header: "ISBN", cell: (row) => textOrDash(row.isbn), className: "whitespace-nowrap" },
    {
      id: "mandatory",
      header: "Required",
      cell: (row) => <Badge tone={row.isMandatory ? "primary" : "neutral"}>{row.isMandatory ? "Mandatory" : "Optional"}</Badge>,
    },
    {
      id: "price",
      header: "Price",
      className: "text-right whitespace-nowrap",
      cell: (row) => <MoneyText amountMinor={row.priceMinor} />,
    },
  ];
}
