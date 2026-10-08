"use client";

import { KeyRound, Pencil, RotateCcwKey, ShieldCheck, UserCog } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StaffActionsProps {
  onEdit?: () => void;
  onStatus?: () => void;
  onProbation?: () => void;
  onCreateSignIn?: () => void;
  onResetPassword?: () => void;
}

export function StaffActions({ onEdit, onStatus, onProbation, onCreateSignIn, onResetPassword }: StaffActionsProps) {
  return (
    <>
      {onCreateSignIn && (
        <Button onClick={onCreateSignIn}>
          <KeyRound />
          Create sign-in
        </Button>
      )}
      {onEdit && (
        <Button variant="secondary" onClick={onEdit}>
          <Pencil />
          Edit details
        </Button>
      )}
      {onStatus && (
        <Button variant="secondary" onClick={onStatus}>
          <UserCog />
          Change status
        </Button>
      )}
      {onProbation && (
        <Button variant="secondary" onClick={onProbation}>
          <ShieldCheck />
          Probation
        </Button>
      )}
      {onResetPassword && (
        <Button variant="secondary" onClick={onResetPassword}>
          <RotateCcwKey />
          Reset password
        </Button>
      )}
    </>
  );
}
