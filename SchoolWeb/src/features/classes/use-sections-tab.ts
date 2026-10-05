import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { useSessionOptions } from "@/features/sessions/api";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useClassOptions } from "./api";
import { sectionColumns } from "./section-columns";
import { useSections } from "./sections-api";
import type { Section } from "./types";

type SectionFilters = { sessionId?: string; classId?: string; status?: string };

export function useSectionsTab(branchId: string, schoolId: string) {
  const can = useCan();
  const sessions = useSessionOptions(branchId);
  const classes = useClassOptions(schoolId);
  const list = useListState<SectionFilters>({});

  // Defaults to the branch's active session until the user picks another.
  const chosen = list.filters.sessionId;
  const sessionId = chosen && sessions.options.some((o) => o.id === chosen) ? chosen : sessions.activeId;
  const session = sessions.sessions.find((item) => item.id === sessionId) ?? null;
  const locked = session?.status === "CLOSED";

  const query = useSections({ ...list.params, branchId, sessionId }, !!sessionId);
  const form = useDialogState<Section>();
  const archiveTarget = useDialogState<Section>();

  const canEdit = can("classes.edit") && !locked;
  const canArchive = can("classes.delete") && !locked;

  const columns = useMemo(
    () =>
      sectionColumns({
        onEdit: canEdit ? form.show : undefined,
        onArchive: canArchive ? archiveTarget.show : undefined,
      }),
    [canEdit, canArchive, form.show, archiveTarget.show],
  );

  return {
    list,
    query,
    rows: query.data?.data,
    loading: sessions.isLoading || query.isLoading,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    sessions,
    classes,
    sessionId,
    locked,
    hasSessions: sessions.options.length > 0,
    canAdd: can("classes.add") && !locked && !!sessionId,
    form,
    archiveTarget,
  };
}
