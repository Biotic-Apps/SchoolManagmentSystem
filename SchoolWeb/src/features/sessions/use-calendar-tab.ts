import { useCallback, useMemo, useState } from "react";
import type { CalendarItem } from "@/components/shared/MonthCalendar";
import { useCan } from "@/features/auth/use-can";
import { currentMonth, monthBounds, type MonthRef } from "@/lib/dates";
import { useDialogState } from "@/lib/use-dialog-state";
import { useCalendarEvents } from "./api";
import { eventColumns } from "./event-columns";
import { eventTypeTone } from "./event-types";
import type { CalendarEvent } from "./types";

export function useCalendarTab(branchId: string | null) {
  const can = useCan();
  const [month, setMonth] = useState<MonthRef>(currentMonth);
  const { from, to } = monthBounds(month);
  const query = useCalendarEvents(branchId, from, to);
  const form = useDialogState<CalendarEvent>();
  const deleteTarget = useDialogState<CalendarEvent>();

  const canEdit = can("sessions.edit");

  const events = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [query.data],
  );

  const items: CalendarItem[] = useMemo(
    () =>
      events.map((event) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        tone: eventTypeTone(event.type),
      })),
    [events],
  );

  const showForm = form.show;
  const onItemClick = useCallback(
    (id: string) => {
      const event = events.find((item) => item.id === id);
      if (event && canEdit) showForm(event);
    },
    [events, canEdit, showForm],
  );

  const columns = useMemo(
    () =>
      eventColumns({
        onEdit: canEdit ? form.show : undefined,
        onDelete: canEdit ? deleteTarget.show : undefined,
      }),
    [canEdit, form.show, deleteTarget.show],
  );

  return {
    month,
    setMonth,
    query,
    events,
    items,
    onItemClick,
    columns,
    canAdd: canEdit && !!branchId,
    form,
    deleteTarget,
  };
}
