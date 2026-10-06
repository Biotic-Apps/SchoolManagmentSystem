import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { NoticesRoute } from "@/features/notices/components/NoticesRoute";

export const metadata: Metadata = { title: "Notices" };

export default function Page() {
  return (
    <ModuleGuard moduleId="notices">
      <NoticesRoute />
    </ModuleGuard>
  );
}
