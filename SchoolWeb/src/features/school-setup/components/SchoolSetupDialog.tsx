"use client";

import { UnsavedChangesGuard } from "@/components/shared/UnsavedChangesGuard";
import { SetupWizard } from "./SetupWizard";

/** "New school": school, main branch, principal and academic year in one go. */
export function SchoolSetupDialog({ onClose }: { onClose: () => void }) {
  return (
    <UnsavedChangesGuard>
      <SetupWizard onClose={onClose} />
    </UnsavedChangesGuard>
  );
}
