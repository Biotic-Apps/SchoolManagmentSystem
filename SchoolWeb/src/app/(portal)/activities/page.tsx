import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { ActivitiesRoute } from "@/features/activities/components/ActivitiesRoute";

export const metadata: Metadata = { title: "Activities & Events" };

export default function Page() {
  return (
    <ModuleGuard moduleId="activities">
      <ActivitiesRoute />
    </ModuleGuard>
  );
}
