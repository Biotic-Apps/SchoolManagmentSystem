import { useMemo, useState } from "react";
import { useIsParent } from "@/features/auth/use-active-child";
import { useCan } from "@/features/auth/use-can";
import { useHealthProfile, useIncidents } from "./api";
import { incidentColumns } from "./incident-columns";

export type HealthEditorMode = "edit" | "request";

/** Health profile + recent incidents of one student; staff edit it, parents request changes. */
export function useHealthTab(studentId: string, readOnly: boolean) {
  const can = useCan();
  const isParent = useIsParent();
  const profile = useHealthProfile(studentId);
  const incidents = useIncidents({ studentId });
  const [editor, setEditor] = useState<HealthEditorMode | null>(null);
  const incidentTableColumns = useMemo(() => incidentColumns({ withStudent: false }), []);

  return {
    profile,
    incidents,
    incidentTableColumns,
    canEdit: !readOnly && !isParent && can("health.edit"),
    canRequest: isParent,
    editor,
    openEditor: (mode: HealthEditorMode) => setEditor(mode),
    closeEditor: () => setEditor(null),
  };
}
