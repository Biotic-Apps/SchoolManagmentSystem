"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import type { MeetingBox } from "../api";
import { useMeetingsList } from "../use-meetings-list";
import { AcceptMeetingDialog } from "./AcceptMeetingDialog";
import { CompleteMeetingDialog } from "./CompleteMeetingDialog";

const EMPTY: Record<MeetingBox, { title: string; description: string }> = {
  upcoming: {
    title: "No upcoming meetings",
    description:
      "Meetings parents book in your open times, requests parents send you, and meetings you schedule appear here. Add open times under My slots so parents can book them.",
  },
  past: { title: "No past meetings", description: "Completed, cancelled and missed meetings appear here." },
};

export function MeetingsListTab({ box }: { box: MeetingBox }) {
  const list = useMeetingsList(box);
  const { query, cancelDialog, noShowDialog, completeDialog, acceptDialog, declineDialog } = list;

  return (
    <>
      <DataTable
        columns={list.columns}
        rows={list.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle={EMPTY[box].title}
        emptyDescription={EMPTY[box].description}
        pagination={list.pagination}
      />
      <ReasonDialog
        open={cancelDialog.open}
        onOpenChange={cancelDialog.onOpenChange}
        title="Cancel meeting"
        description={cancelDialog.item ? `The guardian of ${cancelDialog.item.student.name} is notified.` : undefined}
        label="Reason"
        submitLabel="Cancel meeting"
        submitting={list.cancelling}
        error={list.cancelError}
        onSubmit={list.confirmCancel}
      />
      <ConfirmDialog
        open={noShowDialog.open}
        onOpenChange={noShowDialog.onOpenChange}
        title="Mark as no-show?"
        description={noShowDialog.item ? `${noShowDialog.item.guardian.name} didn't attend this meeting.` : undefined}
        confirmLabel="Mark no-show"
        tone="danger"
        loading={list.markingNoShow}
        onConfirm={list.confirmNoShow}
      />
      <ReasonDialog
        open={declineDialog.open}
        onOpenChange={declineDialog.onOpenChange}
        title="Decline meeting request"
        description={declineDialog.item ? `The guardian of ${declineDialog.item.student.name} is notified.` : undefined}
        label="Reason"
        submitLabel="Decline request"
        submitting={list.declining}
        error={list.declineError}
        onSubmit={list.confirmDecline}
      />
      {completeDialog.item && <CompleteMeetingDialog meeting={completeDialog.item} onClose={completeDialog.close} />}
      {acceptDialog.item && <AcceptMeetingDialog meeting={acceptDialog.item} onClose={acceptDialog.close} />}
    </>
  );
}
