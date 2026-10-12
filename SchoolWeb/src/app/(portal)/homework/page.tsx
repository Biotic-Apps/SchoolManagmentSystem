import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { HomeworkRoute } from "@/features/homework/components/HomeworkRoute";

export const metadata: Metadata = { title: "Homework Submissions" };

export default function Page() {
  return (
    <ModuleGuard moduleId="homework">
      <HomeworkRoute />
    </ModuleGuard>
  );
}
