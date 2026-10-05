"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useUserStatus } from "../api";
import type { UserSummary } from "../types";

export function UserStatusDialog({ user, onClose }: { user: UserSummary | null; onClose: () => void }) {
  const mutation = useUserStatus();
  const disabling = user?.status === "ACTIVE";

  const confirm = () => {
    if (!user) return;
    mutation.mutate({ id: user.id, action: disabling ? "disable" : "enable" }, { onSuccess: onClose });
  };

  return (
    <ConfirmDialog
      open={!!user}
      onOpenChange={(open) => !open && onClose()}
      title={disabling ? `Disable ${user?.name}?` : `Enable ${user?.name}?`}
      description={
        disabling
          ? "They are signed out of every device immediately and can't sign in until enabled again."
          : "They can sign in again with their current password."
      }
      confirmLabel={disabling ? "Disable" : "Enable"}
      tone={disabling ? "danger" : "primary"}
      loading={mutation.isPending}
      onConfirm={confirm}
    />
  );
}
