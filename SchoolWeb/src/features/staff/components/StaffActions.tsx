"use client";

import { Pencil, ShieldCheck, UserCog } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StaffActionsProps {
  onEdit?: () => void;
  onStatus?: () => void;
  onProbation?: () => void;
}

export function StaffActions({ onEdit, onStatus, onProbation }: StaffActionsProps) {
  return (
    <>
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
    </>
  );
}
