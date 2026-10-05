import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { SessionsPage } from "@/features/sessions/components/SessionsPage";

export const metadata: Metadata = { title: "Sessions & Calendar" };

export default function Page() {
  return (
    <ModuleGuard moduleId="sessions">
      <SessionsPage />
    </ModuleGuard>
  );
}
