import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { UsersPage } from "@/features/users/components/UsersPage";

export const metadata: Metadata = { title: "Principals & Admin Users" };

export default function Page() {
  return (
    <ModuleGuard moduleId="users">
      <UsersPage />
    </ModuleGuard>
  );
}
