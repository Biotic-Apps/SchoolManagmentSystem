import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { ProfilePage } from "@/features/profile/components/ProfilePage";

export const metadata: Metadata = { title: "Profile & Security" };

export default function Page() {
  return (
    <ModuleGuard moduleId="profile">
      <ProfilePage />
    </ModuleGuard>
  );
}
