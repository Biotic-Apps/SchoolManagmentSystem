"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import type { Room } from "../types";
import { useRoomForm } from "../use-room-form";

interface RoomFormDialogProps {
  item: Room | null;
  branchId: string;
  onClose: () => void;
}

export function RoomFormDialog({ item, branchId, onClose }: RoomFormDialogProps) {
  const { form, submit, submitting, formError } = useRoomForm(item, branchId, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={item ? "Edit room" : "Add room"}
      submitLabel={item ? "Save changes" : "Add room"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <TextField name="name" label="Name" required placeholder="e.g. Room 12" />
      <TextField name="capacity" label="Capacity" inputMode="numeric" hint="Seats in the room (optional)." />
    </FormDialog>
  );
}
