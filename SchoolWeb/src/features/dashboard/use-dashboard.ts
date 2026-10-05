import { useMemo } from "react";
import { labelFor, navItem } from "@/config/navigation";
import { useSession } from "@/features/auth/session-context";
import { can } from "@/lib/permissions";
import { formatNumber } from "@/lib/format";
import { useDashboardSummary } from "./api";
import { DASHBOARD_STATS } from "./stat-definitions";
import { useDashboardScope } from "./use-dashboard-scope";

export function useDashboard() {
  const { session, isDemo } = useSession();
  const scope = useDashboardScope();
  const allowed = can(session, "dashboard.view") && !isDemo;
  const query = useDashboardSummary(scope.scope, allowed);
  const summary = query.data;

  const stats = useMemo(
    () =>
      DASHBOARD_STATS.filter((stat) => can(session, stat.permission))
        .filter((stat) => !summary || summary[stat.key] !== undefined)
        .map((stat) => ({
          ...stat,
          value: summary ? formatNumber(summary[stat.key]) : undefined,
          href: navItem(stat.link).route,
        })),
    [session, summary],
  );

  return {
    title: labelFor(session?.activeRole, "dashboard"),
    greetingName: session?.user.name ?? "",
    scope,
    stats,
    loading: query.isLoading,
    error: query.error,
    retry: () => query.refetch(),
  };
}
