"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useArchiveSection } from "../sections-api";
import type { Section } from "../types";

interface SectionArchiveDialogProps {
  section: Section | null;
  onClose: () => void;
}

export function SectionArchiveDialog({ section, onClose }: SectionArchiveDialogProps) {
  const mutation = useArchiveSection();
  const confirm = () => section && mutation.mutate(section.id, { onSuccess: onClose });

  return (
    <ConfirmDialog
      open={!!section}
      onOpenChange={(open) => !open && onClose()}
      title={`Archive section ${section?.className ?? ""} ${section?.name ?? ""}?`}
      description="Archived sections can't take new students or be edited. Their history is kept."
      confirmLabel="Archive"
      tone="danger"
      loading={mutation.isPending}
      onConfirm={confirm}
    />
  );
}
