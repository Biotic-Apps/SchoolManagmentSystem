import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { StaffDetailPage } from "@/features/staff/components/StaffDetailPage";

export const metadata: Metadata = { title: "Staff profile" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ModuleGuard moduleId="staff" detail>
      <StaffDetailPage staffId={id} />
    </ModuleGuard>
  );
}
