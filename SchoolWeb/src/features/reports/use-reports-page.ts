import { useState } from "react";
import { useReportCatalog } from "./api";
import { groupByArea } from "./catalog";
import { useRecentExports } from "./recent-exports";
import type { Report } from "./types";

export function useReportsPage() {
  const catalog = useReportCatalog();
  const [selected, setSelected] = useState<Report | null>(null);
  return {
    catalog,
    groups: groupByArea(catalog.data ?? []),
    selected,
    select: setSelected,
    closeForm: () => setSelected(null),
    recent: useRecentExports(),
  };
}
