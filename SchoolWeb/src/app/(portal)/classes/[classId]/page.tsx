import type { Metadata } from "next";
import { ClassSetupPage } from "@/features/classes/components/setup/ClassSetupPage";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";

export const metadata: Metadata = { title: "Class setup" };

export default async function Page({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  return (
    <ModuleGuard moduleId="classes" detail>
      <ClassSetupPage classId={classId} />
    </ModuleGuard>
  );
}
