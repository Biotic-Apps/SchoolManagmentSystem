import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { SettingsRoute } from "@/features/settings/components/SettingsRoute";

export const metadata: Metadata = { title: "Settings & Backups" };

export default function Page() {
  return (
    <ModuleGuard moduleId="settings">
      <SettingsRoute />
    </ModuleGuard>
  );
}
