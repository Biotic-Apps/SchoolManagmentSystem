import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useSession } from "@/features/auth/session-context";
import { useSettingsSchool } from "./use-settings-school";

export type SettingsTabId = "school" | "notifications" | "policies" | "support" | "backups" | "imports";

export function useSettingsRoute() {
  const can = useCan();
  const { session } = useSession();
  const school = useSettingsSchool();
  const [tab, setTab] = useState<SettingsTabId>("school");

  const isSuperAdmin = session?.activeRole === "SUPER_ADMIN";
  const isPrincipal = session?.activeRole === "PRINCIPAL";
  const canEdit = can("settings.edit");

  return {
    school,
    tab,
    setTab: (value: string) => setTab(value as SettingsTabId),
    canEdit,
    isSuperAdmin,
    showSupport: can("settings.view"),
    showBackups: isSuperAdmin,
    showImports: canEdit || isPrincipal,
  };
}
