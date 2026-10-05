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
      title={archiving ? `Archive ${school?.name}?` : `Activate ${school?.name}?`}
      description={
        archiving
          ? "Archived schools are hidden from day-to-day lists. History is kept and you can activate it again."
          : "The school becomes available again in all lists."
      }
      confirmLabel={archiving ? "Archive" : "Activate"}
      tone={archiving ? "danger" : "primary"}
      loading={mutation.isPending}
      onConfirm={confirm}
    />
  );
}
