import type { Metadata } from "next";
import { BranchesPage } from "@/features/branches/components/BranchesPage";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";

export const metadata: Metadata = { title: "Branches" };

export default function Page() {
  return (
    <ModuleGuard moduleId="branches">
      <BranchesPage />
    </ModuleGuard>
  );
}
