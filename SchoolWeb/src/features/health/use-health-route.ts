import { useState } from "react";
import { useCan } from "@/features/auth/use-can";

export type HealthTabId = "incidents" | "alerts" | "requests";

export function useHealthRoute() {
  const can = useCan();
  const [tab, setTab] = useState<HealthTabId>("incidents");
  return {
    tab,
    setTab: (value: string) => setTab(value as HealthTabId),
    canEdit: can("health.edit"),
  };
}
