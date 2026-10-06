import { Check, X } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { RELATION_OPTIONS, optionName } from "@/features/people/options";
import { placementLabel } from "@/features/students/options";
import { formatDateTime } from "@/lib/format";
import type { ChildLinkRequest } from "./types";

interface LinkRequestHandlers {
  onApprove?: (item: ChildLinkRequest) => void;
  onReject?: (item: ChildLinkRequest) => void;
}

function TwoLine({ title, caption }: { title: string; caption: string }) {
  return (
    <span className="flex flex-col">
      <span className="font-medium">{title}</span>
      <span className="text-caption text-fg-muted">{caption}</span>
    </span>
  );
}

export function linkRequestColumns({ onApprove, onReject }: LinkRequestHandlers): DataTableColumn<ChildLinkRequest>[] {
  return [
    { id: "guardian", header: "Parent", cell: (row) => <TwoLine title={row.guardian.name} caption={row.guardian.phone} /> },
    { id: "student", header: "Student", cell: (row) => <TwoLine title={row.student.name} caption={row.student.admissionNo} /> },
    { id: "section", header: "Class", cell: (row) => placementLabel(row.student.className, row.student.sectionName) },
    { id: "relation", header: "Relation", cell: (row) => optionName(RELATION_OPTIONS, row.relation) },
    { id: "requested", header: "Requested", cell: (row) => formatDateTime(row.createdAt), className: "whitespace-nowrap" },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          actions={[
            { id: "approve", label: "Approve", icon: Check, onSelect: () => onApprove?.(row), hidden: !onApprove },
            { id: "reject", label: "Reject", icon: X, danger: true, onSelect: () => onReject?.(row), hidden: !onReject },
          ]}
        />
      ),
    },
  ];
}
