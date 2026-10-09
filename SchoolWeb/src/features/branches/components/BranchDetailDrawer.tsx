"use client";

import { Clock, Pencil, Settings, UserCog } from "lucide-react";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DetailList } from "@/components/shared/DetailList";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { weekdayLabels } from "@/components/shared/WeekdayPicker";
import { Button } from "@/components/ui/Button";
import { EntityHistory } from "@/features/audit/components/EntityHistory";
import { EMPTY_VALUE, formatDate, textOrDash } from "@/lib/format";
import { formatTime, formatTimeRange } from "@/lib/time";
import { useBranch } from "../api";
import type { Branch } from "../types";

interface BranchDetailDrawerProps {
  branch: Branch | null;
  onClose: () => void;
  onEdit?: (branch: Branch) => void;
  onEditTimings?: (branch: Branch) => void;
  onChangePrincipal?: (branch: Branch) => void;
  onSettings?: (branch: Branch) => void;
}

function principalNames(branch: Branch): Record<string, string> | undefined {
  return branch.principal ? { [branch.principal.id]: branch.principal.name } : undefined;
}

export function BranchDetailDrawer({ branch, onClose, onEdit, onEditTimings, onChangePrincipal, onSettings }: BranchDetailDrawerProps) {
  const query = useBranch(branch?.id ?? null);
  const data = query.data ?? branch;
  const timings = data?.timings;

  return (
    <DetailDrawer
      open={!!branch}
      onOpenChange={(open) => !open && onClose()}
      title={data?.name ?? "Branch"}
      description={data && <StatusBadge status={data.status} />}
      actions={
        data && (
          <>
            {onEdit && (
              <Button variant="secondary" size="sm" onClick={() => onEdit(data)}>
                <Pencil />
                Edit
              </Button>
            )}
            {onEditTimings && (
              <Button variant="secondary" size="sm" onClick={() => onEditTimings(data)}>
                <Clock />
                Edit timings
              </Button>
            )}
            {onChangePrincipal && (
              <Button variant="secondary" size="sm" onClick={() => onChangePrincipal(data)}>
                <UserCog />
                Change principal
              </Button>
            )}
            {onSettings && (
              <Button variant="secondary" size="sm" onClick={() => onSettings(data)}>
                <Settings />
                Settings
              </Button>
            )}
          </>
        )
      }
    >
      {data && (
        <>
          <DetailList
            items={[
              { label: "School", value: data.schoolName },
              { label: "Code", value: data.code },
              { label: "Principal", value: data.principal?.name ?? EMPTY_VALUE },
              { label: "Working days", value: weekdayLabels(data.workingDays) || EMPTY_VALUE },
              { label: "School opens / closes", value: formatTimeRange(timings?.opensAt, timings?.closesAt) },
              { label: "Teachers arrive / leave", value: formatTimeRange(timings?.staffArrivesAt, timings?.staffLeavesAt) },
              { label: "Attendance locks at", value: formatTime(timings?.attendanceLockAt) },
              { label: "Phone", value: textOrDash(data.phone) },
              { label: "Email", value: textOrDash(data.email) },
              { label: "Address", value: textOrDash(data.address) },
              { label: "Created", value: formatDate(data.createdAt) },
            ]}
          />
          <EntityHistory entityType="Branch" entityId={data.id} names={principalNames(data)} />
        </>
      )}
    </DetailDrawer>
  );
}
