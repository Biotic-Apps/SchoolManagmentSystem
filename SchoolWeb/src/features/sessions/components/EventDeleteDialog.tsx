"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeleteCalendarEvent } from "../api";
import { eventScopeLabel } from "../event-columns";
import type { CalendarEvent } from "../types";

interface EventDeleteDialogProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export function EventDeleteDialog({ event, onClose }: EventDeleteDialogProps) {
  const mutation = useDeleteCalendarEvent();

  const confirm = () => {
    if (event) mutation.mutate(event.id, { onSuccess: onClose });
  };

  return (
    <ConfirmDialog
      open={!!event}
      onOpenChange={(open) => !open && onClose()}
      title={`Delete "${event?.title}"?`}
      description={event ? `It is removed from the calendar (${eventScopeLabel(event).toLowerCase()}).` : undefined}
      confirmLabel="Delete"
      tone="danger"
      loading={mutation.isPending}
      onConfirm={confirm}
    />
  );
}
