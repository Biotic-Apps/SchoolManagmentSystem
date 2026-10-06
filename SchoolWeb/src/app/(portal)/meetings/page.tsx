import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { MeetingsRoute } from "@/features/meetings/components/MeetingsRoute";

export const metadata: Metadata = { title: "Meetings & Appointments" };

export default function Page() {
  return (
    <ModuleGuard moduleId="meetings">
      <MeetingsRoute />
    </ModuleGuard>
  );
}
