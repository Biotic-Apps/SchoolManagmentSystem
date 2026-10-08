"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { errorMessage } from "@/lib/error-messages";
import { useResetStaffPassword } from "../api";
import type { StaffDetail } from "../types";
import { SignInResultDialog } from "./SignInResultDialog";

interface ResetPasswordDialogProps {
  staff: StaffDetail;
  onClose: () => void;
}

export function ResetPasswordDialog({ staff, onClose }: ResetPasswordDialogProps) {
  const reset = useResetStaffPassword(staff.id);
  const [password, setPassword] = useState<string | null>(null);

  if (password) {
    return (
      <SignInResultDialog
        title={`New password for ${staff.name}`}
        description="Their old password no longer works and they were signed out everywhere."
        name={staff.name}
        email={staff.login?.email}
        phone={staff.login?.phone}
        temporaryPassword={password}
        onClose={onClose}
      />
    );
  }

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Reset ${staff.name}'s password?`}
      description="A new temporary password is created. Their current password stops working and they are signed out on every device."
      confirmLabel="Reset password"
      loading={reset.isPending}
      error={reset.error ? errorMessage(reset.error) : null}
      onConfirm={() => reset.mutate(undefined, { onSuccess: (data) => setPassword(data.temporaryPassword) })}
    />
  );
}
