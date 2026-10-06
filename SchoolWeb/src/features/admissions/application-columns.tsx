import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EMPTY_VALUE, formatDate } from "@/lib/format";
import { childName, primaryGuardian } from "./status";
import type { Application } from "./types";

export function GuardianCell({ application }: { application: Application }) {
  const guardian = primaryGuardian(application);
  if (!guardian) return <>{EMPTY_VALUE}</>;
  return (
    <span className="flex flex-col">
      <span>{guardian.name}</span>
      <span className="text-caption text-fg-muted">{guardian.phone}</span>
    </span>
  );
}

export function applicationColumns(): DataTableColumn<Application>[] {
  return [
    { id: "no", header: "Application no.", cell: (row) => <span className="font-medium">{row.applicationNo}</span> },
    { id: "child", header: "Child", cell: (row) => <PersonCell name={childName(row)} caption={row.className} /> },
    { id: "guardian", header: "Primary guardian", cell: (row) => <GuardianCell application={row} /> },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge
          status={row.status}
          label={row.status === "WAITLISTED" && row.waitlistPosition ? `Waitlisted #${row.waitlistPosition}` : undefined}
        />
      ),
    },
    { id: "created", header: "Created", cell: (row) => formatDate(row.createdAt) },
  ];
}
