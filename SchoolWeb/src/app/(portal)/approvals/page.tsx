import type { Metadata } from "next";
import { ApprovalsPage } from "@/features/approvals/components/ApprovalsPage";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";

export const metadata: Metadata = { title: "Approvals" };

export default function Page() {
  return (
    <ModuleGuard moduleId="approvals">
      <ApprovalsPage />
    </ModuleGuard>
  );
}
