import { ArrowRightLeft, Pencil } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, textOrDash } from "@/lib/format";
import type { Enquiry } from "./types";

interface EnquiryRowHandlers {
  onUpdate?: (item: Enquiry) => void;
  onConvert?: (item: Enquiry) => void;
}

const isOpen = (item: Enquiry) => item.status === "NEW" || item.status === "CONTACTED";

export function enquiryColumns({ onUpdate, onConvert }: EnquiryRowHandlers): DataTableColumn<Enquiry>[] {
  return [
    {
      id: "child",
      header: "Child",
      cell: (row) => <PersonCell name={row.childName} caption={row.dob ? `Born ${formatDate(row.dob)}` : null} />,
    },
    { id: "class", header: "Class", cell: (row) => row.className },
    {
      id: "guardian",
      header: "Guardian",
      cell: (row) => (
        <span className="flex flex-col">
          <span>{row.guardianName}</span>
          <span className="text-caption text-fg-muted">{row.phone}</span>
        </span>
      ),
    },
    { id: "source", header: "Source", cell: (row) => textOrDash(row.source) },
    { id: "followUp", header: "Follow-up", cell: (row) => formatDate(row.followUpDate) },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    { id: "created", header: "Created", cell: (row) => formatDate(row.createdAt) },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          label={`Actions for ${row.childName}`}
          actions={[
            { id: "update", label: "Update", icon: Pencil, onSelect: () => onUpdate?.(row), hidden: !onUpdate },
            {
              id: "convert",
              label: "Convert to application",
              icon: ArrowRightLeft,
              onSelect: () => onConvert?.(row),
              hidden: !onConvert || !isOpen(row),
            },
          ]}
        />
      ),
    },
  ];
}
