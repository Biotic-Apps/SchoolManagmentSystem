"use client";

import { DetailList } from "@/components/shared/DetailList";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/Card";
import { EntityHistory } from "@/features/audit/components/EntityHistory";
import { formatDate, textOrDash } from "@/lib/format";
import type { StaffDetail } from "../types";

export function ProfileTab({ staff }: { staff: StaffDetail }) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <DetailList
          items={[
            { label: "Email", value: textOrDash(staff.email) },
            { label: "Phone", value: textOrDash(staff.phone) },
            { label: "CNIC", value: textOrDash(staff.cnic) },
            { label: "Qualification", value: textOrDash(staff.qualification) },
            { label: "Join date", value: formatDate(staff.joinDate) },
            { label: "Branch", value: textOrDash(staff.branchName) },
            { label: "Status", value: <StatusBadge status={staff.status} /> },
            { label: "Reviewer", value: staff.requiresReview ? textOrDash(staff.reviewer?.name) : "Not on review" },
          ]}
        />
      </Card>
      <EntityHistory entityType="Staff" entityId={staff.id} />
    </div>
  );
}
