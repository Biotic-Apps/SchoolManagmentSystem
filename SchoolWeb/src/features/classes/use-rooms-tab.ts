import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { roomColumns } from "./room-columns";
import { useRooms } from "./rooms-api";
import type { Room } from "./types";

export function useRoomsTab(branchId: string) {
  const can = useCan();
  const list = useListState({});
  const query = useRooms({ ...list.params, branchId });
  const form = useDialogState<Room>();
  const canEdit = can("classes.edit");

  const columns = useMemo(() => roomColumns(canEdit ? form.show : undefined), [canEdit, form.show]);

  return {
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    canAdd: can("classes.add"),
    form,
  };
}
