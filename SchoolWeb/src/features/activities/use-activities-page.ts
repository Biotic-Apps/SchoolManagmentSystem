import { useState } from "react";
import type { CalendarItem } from "@/components/shared/MonthCalendar";
import { useCan } from "@/features/auth/use-can";
import { useAcademicScope } from "@/features/classes/use-academic-scope";
import { useAudienceOptions } from "@/features/notices/use-audience-options";
import { currentMonth, monthBounds, type MonthRef } from "@/lib/dates";
import { statusTone } from "@/lib/status-tone";
import { useDialogState } from "@/lib/use-dialog-state";
import { useActivities } from "./api";
import { localParts } from "./options";
import type { Activity } from "./types";

export type ActivitiesView = "list" | "calendar";

export function useActivitiesPage() {
  const can = useCan();
  const scope = useAcademicScope();
  const [view, setView] = useState<ActivitiesView>("list");
  const [month, setMonth] = useState<MonthRef>(currentMonth);
  const [type, setType] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [detailId, setDetailId] = useState<string | null>(null);
  const composer = useDialogState<Activity>();
  const audience = useAudienceOptions({ schoolId: scope.schoolId, branchId: scope.branchId, sessionId: scope.sessionId });

  // The calendar asks for the shown month; the list shows everything matching the filters.
  const range = view === "calendar" ? monthBounds(month) : {};
  const query = useActivities({ branchId: scope.branchId, type, status, ...range }, !!scope.branchId);
  const rows = query.data ?? [];

  const calendarItems: CalendarItem[] = rows.map((activity) => ({
    id: activity.id,
    title: activity.title,
    startDate: localParts(activity.startAt).date,
    endDate: localParts(activity.endAt).date,
    tone: statusTone(activity.status),
  }));

  return {
    scope,
    audience,
    view,
    setView: (value: string) => setView(value as ActivitiesView),
    month,
    setMonth,
    type,
    setType,
    status,
    setStatus,
    query,
    rows,
    calendarItems,
    composer,
    canPropose: can("activities.add") && !!scope.branchId,
    detailId,
    openDetail: (id: string) => setDetailId(id),
    closeDetail: () => setDetailId(null),
  };
}
