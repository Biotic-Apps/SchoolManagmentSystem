"use client";

import { CircleCheck } from "lucide-react";
import { AttachmentList } from "@/components/shared/AttachmentList";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DetailList } from "@/components/shared/DetailList";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatDateTime, humanize, textOrDash } from "@/lib/format";
import { classSectionOf } from "../incident-columns";
import type { IncidentDetail } from "../types";
import { useCloseIncidentAction } from "../use-close-incident";
import { TextBlock } from "./TextBlock";

interface IncidentDetailDrawerProps {
  incident: IncidentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IncidentDetailDrawer({ incident, open, onOpenChange }: IncidentDetailDrawerProps) {
  const close = useCloseIncidentAction(incident);
  if (!incident) return null;

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={incident.student.name}
      description={[classSectionOf(incident.student), formatDateTime(incident.occurredAt)].filter(Boolean).join(" · ")}
      actions={
        close.canClose && (
          <Button size="sm" variant="secondary" onClick={() => close.setOpen(true)}>
            <CircleCheck />
            Close incident
          </Button>
        )
      }
    >
      <DetailList
        items={[
          { label: "Type", value: humanize(incident.type) },
          { label: "Severity", value: <StatusBadge status={incident.severity} /> },
          { label: "Status", value: <StatusBadge status={incident.status} /> },
          { label: "Reported by", value: textOrDash(incident.reportedBy?.name) },
        ]}
      />
      <TextBlock title="What happened" text={incident.description} />
      <TextBlock title="Action taken" text={incident.actionTaken} />
      {!!incident.attachments?.length && (
        <div className="flex flex-col gap-2">
          <SectionHeading title="Attachments" />
          <AttachmentList items={incident.attachments} />
        </div>
      )}
      {incident.status === "CLOSED" && (
        <TextBlock
          title="Closing note"
          text={incident.closeNote}
          caption={incident.closedAt ? `Closed ${formatDateTime(incident.closedAt)}` : undefined}
        />
      )}
      <ReasonDialog
        open={close.open}
        onOpenChange={close.setOpen}
        title="Close this incident?"
        description="Closing marks the follow-up as done. The record itself stays unchanged."
        label="Note"
        required={false}
        submitLabel="Close incident"
        submitting={close.submitting}
        onSubmit={close.confirm}
      />
    </DetailDrawer>
  );
}
