import { Armchair } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { RowActions } from "@/components/shared/RowActions";
import { EMPTY_VALUE, formatDate } from "@/lib/format";
import { GuardianCell } from "./application-columns";
import { childName } from "./status";
import type { Application } from "./types";

export function waitingListColumns({ onOffer }: { onOffer?: (item: Application) => void }): DataTableColumn<Application>[] {
  return [
    {
      id: "position",
      header: "#",
      className: "w-14",
      cell: (row) => <span className="font-semibold tabular-nums">{row.waitlistPosition ?? EMPTY_VALUE}</span>,
    },
    { id: "no", header: "Application no.", cell: (row) => row.applicationNo },
    { id: "child", header: "Child", cell: (row) => <PersonCell name={childName(row)} /> },
    { id: "class", header: "Class", cell: (row) => row.className },
    { id: "guardian", header: "Primary guardian", cell: (row) => <GuardianCell application={row} /> },
    { id: "created", header: "Applied", cell: (row) => formatDate(row.createdAt) },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          label={`Actions for ${childName(row)}`}
          actions={[
            { id: "offer", label: "Offer seat", icon: Armchair, onSelect: () => onOffer?.(row), hidden: !onOffer },
          ]}
        />
      ),
    },
  ];
}
