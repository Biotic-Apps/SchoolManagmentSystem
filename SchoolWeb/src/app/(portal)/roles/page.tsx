import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { RolesPage } from "@/features/roles/components/RolesPage";

export const metadata: Metadata = { title: "Roles & Permissions" };

export default function Page() {
  return (
    <ModuleGuard moduleId="roles">
      <RolesPage />
    </ModuleGuard>
  );
}
