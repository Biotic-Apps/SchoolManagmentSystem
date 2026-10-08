"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useSchoolStatus } from "../api";
import type { School } from "../types";

interface SchoolStatusDialogProps {
  school: School | null;
  onClose: () => void;
}

export function SchoolStatusDialog({ school, onClose }: SchoolStatusDialogProps) {
  const mutation = useSchoolStatus();
  const archiving = school?.status === "ACTIVE";

  const confirm = () => {
    if (!school) return;
    mutation.mutate({ id: school.id, action: archiving ? "archive" : "activate" }, { onSuccess: onClose });
  };

  return (
    <ConfirmDialog
      open={!!school}
      onOpenChange={(open) => !open && onClose()}
      title={archiving ? `Archive ${school?.name}?` : `Restore ${school?.name}?`}
      description={
        archiving
          ? "Everyone in this school (principal, staff, parents) will no longer be able to sign in, and it is hidden from day-to-day lists. All records are kept and you can restore it any time."
          : "The school becomes active again and its users can sign in as before."
      }
      confirmLabel={archiving ? "Archive" : "Restore"}
      tone={archiving ? "danger" : "primary"}
      loading={mutation.isPending}
      onConfirm={confirm}
    />
  );
}
