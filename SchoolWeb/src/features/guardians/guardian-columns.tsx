import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { RELATION_OPTIONS, optionName } from "@/features/people/options";
import { textOrDash } from "@/lib/format";
import { AccountBadge } from "./components/AccountBadge";
import type { Guardian } from "./types";

export function guardianColumns(): DataTableColumn<Guardian>[] {
  return [
    { id: "name", header: "Name", cell: (row) => <PersonCell name={row.name} /> },
    { id: "phone", header: "Phone", cell: (row) => row.phone, className: "whitespace-nowrap" },
    { id: "email", header: "Email", cell: (row) => textOrDash(row.email) },
    { id: "relation", header: "Relation", cell: (row) => textOrDash(optionName(RELATION_OPTIONS, row.relation)) },
    { id: "account", header: "Account", cell: (row) => <AccountBadge hasAccount={row.hasAccount} /> },
  ];
}
