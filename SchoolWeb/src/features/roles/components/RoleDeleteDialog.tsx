"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeleteRole } from "../api";
import type { Role } from "../types";

interface RoleDeleteDialogProps {
  role: Role | null;
  onClose: () => void;
}

export function RoleDeleteDialog({ role, onClose }: RoleDeleteDialogProps) {
  const mutation = useDeleteRole();

  const confirm = () => {
    if (role) mutation.mutate(role.id, { onSuccess: onClose });
  };

  return (
    <ConfirmDialog
      open={!!role}
      onOpenChange={(open) => !open && onClose()}
      title={`Delete ${role?.name}?`}
      description="This custom role is not assigned to anyone. Deleting it can't be undone."
      confirmLabel="Delete role"
      tone="danger"
      loading={mutation.isPending}
      onConfirm={confirm}
    />
  );
}
