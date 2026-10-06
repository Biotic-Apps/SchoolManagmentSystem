import { ShieldCheck, ShieldOff } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { textOrDash } from "@/lib/format";
import type { PickupPerson } from "./types";

interface PersonActions {
  onVerify: (person: PickupPerson) => void;
  onRevoke: (person: PickupPerson) => void;
}

export function pickupPersonColumns(actions: PersonActions | null): DataTableColumn<PickupPerson>[] {
  const columns: DataTableColumn<PickupPerson>[] = [
    {
      id: "name",
      header: "Name",
      className: "min-w-48",
      cell: (row) => <PersonCell name={row.name} caption={row.relation} photoUrl={row.photoUrl} />,
    },
    { id: "phone", header: "Phone", className: "whitespace-nowrap", cell: (row) => row.phone },
    { id: "cnic", header: "CNIC", className: "whitespace-nowrap tabular-nums", cell: (row) => textOrDash(row.cnic) },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];
  if (!actions) return columns;
  return [
    ...columns,
    {
      id: "actions",
      header: "",
      className: "w-px",
      cell: (row) => (
        <RowActions
          label={`Actions for ${row.name}`}
          actions={[
            {
              id: "verify",
              label: "Verify",
              icon: ShieldCheck,
              hidden: row.status === "VERIFIED",
              onSelect: () => actions.onVerify(row),
            },
            {
              id: "revoke",
              label: "Revoke",
              icon: ShieldOff,
              danger: true,
              hidden: row.status === "REVOKED",
              onSelect: () => actions.onRevoke(row),
            },
          ]}
        />
      ),
    },
  ];
}
