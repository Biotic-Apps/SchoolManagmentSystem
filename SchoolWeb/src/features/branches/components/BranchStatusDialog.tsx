"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useBranchStatus } from "../api";
import type { Branch } from "../types";

export function BranchStatusDialog({ branch, onClose }: { branch: Branch | null; onClose: () => void }) {
  const mutation = useBranchStatus();
  const archiving = branch?.status === "ACTIVE";

  const confirm = () => {
    if (!branch) return;
    mutation.mutate({ id: branch.id, action: archiving ? "archive" : "activate" }, { onSuccess: onClose });
  };

  return (
    <ConfirmDialog
      open={!!branch}
      onOpenChange={(open) => !open && onClose()}
      title={archiving ? `Archive ${branch?.name}?` : `Activate ${branch?.name}?`}
      description={
        archiving
          ? "Archived branches are hidden from day-to-day lists. Their history is kept."
          : "The branch becomes available again in all lists."
      }
      confirmLabel={archiving ? "Archive" : "Activate"}
      tone={archiving ? "danger" : "primary"}
      loading={mutation.isPending}
      onConfirm={confirm}
    />
  );
}
