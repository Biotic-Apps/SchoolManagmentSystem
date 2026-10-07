import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { StudentDetailPage } from "@/features/students/components/StudentDetailPage";

export const metadata: Metadata = { title: "Student" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ModuleGuard moduleId="students" detail>
      <StudentDetailPage studentId={id} />
    </ModuleGuard>
  );
}
