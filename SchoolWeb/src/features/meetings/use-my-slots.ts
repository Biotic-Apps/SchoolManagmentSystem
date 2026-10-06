import { useState } from "react";
import { useCurrentUserId } from "@/features/auth/use-can";
import { addDays, todayIso } from "@/lib/dates";
import { useDialogState } from "@/lib/use-dialog-state";
import { useDeleteSlot, useSlots } from "./api";
import { groupByDate, weekStart } from "./options";
import type { MeetingSlot } from "./types";

/** The signed-in staff member's slots, one week at a time. */
export function useMySlots() {
  const me = useCurrentUserId();
  const [from, setFrom] = useState(() => weekStart(todayIso()));
  const to = addDays(from, 6);
  const query = useSlots({ staffUserId: me, from, to }, !!me);
  const remove = useDeleteSlot();
  const addDialog = useDialogState<true>();
  const deleteDialog = useDialogState<MeetingSlot>();

  return {
    query,
    from,
    to,
    days: groupByDate(query.data ?? []),
    previousWeek: () => setFrom(addDays(from, -7)),
    nextWeek: () => setFrom(addDays(from, 7)),
    thisWeek: () => setFrom(weekStart(todayIso())),
    isThisWeek: from === weekStart(todayIso()),
    addDialog,
    deleteDialog,
    deleting: remove.isPending,
    confirmDelete: () => deleteDialog.item && remove.mutate(deleteDialog.item.id, { onSuccess: deleteDialog.close }),
  };
}
