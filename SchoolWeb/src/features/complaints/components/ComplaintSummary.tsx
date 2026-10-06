import { DetailList, type DetailItem } from "@/components/shared/DetailList";
import { formatDateTime } from "@/lib/format";
import { categoryLabel } from "../options";
import type { Complaint } from "../types";

interface ComplaintSummaryProps {
  complaint: Complaint;
  /** Principal / super admin only. */
  showRegarding: boolean;
}

export function ComplaintSummary({ complaint, showRegarding }: ComplaintSummaryProps) {
  const items: DetailItem[] = [
    { label: "Category", value: categoryLabel(complaint.category) },
    { label: "Student", value: complaint.student?.name },
    { label: "Filed by", value: complaint.complainant?.name ?? "Anonymous" },
    { label: "Assigned to", value: complaint.assignee?.name ?? "Not assigned yet" },
    { label: "Response due", value: formatDateTime(complaint.slaDueAt) },
    { label: "Filed on", value: formatDateTime(complaint.createdAt) },
    ...(showRegarding && complaint.against ? [{ label: "Regarding", value: complaint.against.name }] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <DetailList items={items} />
      <p className="whitespace-pre-wrap break-words rounded-input bg-background px-4 py-3 text-label text-fg">
        {complaint.description}
      </p>
    </div>
  );
}
