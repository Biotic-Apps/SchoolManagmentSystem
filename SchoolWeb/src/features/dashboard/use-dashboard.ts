import { useMemo } from "react";
import { labelFor, navItem } from "@/config/navigation";
import { useSession } from "@/features/auth/session-context";
import { can } from "@/lib/permissions";
import { formatNumber } from "@/lib/format";
import { useDashboardSummary } from "./api";
import { DASHBOARD_STATS } from "./stat-definitions";
import type { DashboardSummary } from "./types";
import { useDashboardScope } from "./use-dashboard-scope";
import { useDashboardView } from "./use-dashboard-view";
import { useMenuIds } from "./use-menu-ids";

function countOf(summary: DashboardSummary | undefined, key: string): number | undefined {
  const value = summary?.[key];
  return typeof value === "number" ? value : undefined;
}

export function useDashboard() {
  const { session, isDemo } = useSession();
  const view = useDashboardView();
  const menu = useMenuIds();
  const scope = useDashboardScope();
  const allowed = can(session, "dashboard.view") && !isDemo && view !== "parent";
  const query = useDashboardSummary(scope.scope, allowed);
  const summary = query.data;

  const stats = useMemo(
    () =>
      DASHBOARD_STATS.filter((stat) => can(session, stat.permission))
        .filter((stat) => !summary || countOf(summary, stat.key) !== undefined)
        .map((stat) => ({
          ...stat,
          value: summary ? formatNumber(countOf(summary, stat.key)) : undefined,
          href: navItem(stat.link).route,
        })),
    [session, summary],
  );

  return {
    view,
    title: labelFor(session?.activeRole, "dashboard"),
    greetingName: session?.user.name ?? "",
    scope,
    stats,
    attendanceToday: summary?.attendanceToday,
    canOpenAttendance: menu.has("attendance"),
    showPending: view === "leader" && can(session, "dashboard.view") && !isDemo,
    showNoticesFeed: view !== "parent" && can(session, "notices.view") && !menu.has("notices"),
    loading: query.isLoading,
    error: query.error,
    retry: () => query.refetch(),
  };
}

export type DashboardState = ReturnType<typeof useDashboard>;
