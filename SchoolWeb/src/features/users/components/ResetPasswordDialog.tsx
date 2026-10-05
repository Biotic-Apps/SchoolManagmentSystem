"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useResetPassword } from "../api";
import type { UserSummary } from "../types";

interface ResetPasswordDialogProps {
  user: UserSummary | null;
  onClose: () => void;
  onReset: (temporaryPassword: string) => void;
}

export function ResetPasswordDialog({ user, onClose, onReset }: ResetPasswordDialogProps) {
  const mutation = useResetPassword();

  const confirm = () => {
    if (!user) return;
    mutation.mutate(user.id, {
      onSuccess: (password) => {
        onClose();
        onReset(password);
      },
    });
  };

  return (
    <ConfirmDialog
      open={!!user}
      onOpenChange={(open) => !open && onClose()}
      title={`Reset password for ${user?.name}?`}
      description="A temporary password is generated and shown once. They must change it when they next sign in."
      confirmLabel="Reset password"
      tone="danger"
      loading={mutation.isPending}
      onConfirm={confirm}
    />
  );
}
