import { useDialogState } from "@/lib/use-dialog-state";
import { registerColumns } from "./register-columns";
import type { RegisterEntry } from "./types";
import { useRegisterTab } from "./use-register-tab";

/** Register tab state plus the table columns and the correction dialog. */
export function useRegisterPanel(sectionId: string | null, date: string) {
  const tab = useRegisterTab(sectionId, date);
  const correction = useDialogState<RegisterEntry>();

  const columns = registerColumns({
    editable: tab.canEdit,
    alerts: new Map(tab.alerts.map((alert) => [alert.studentId, alert])),
    onStatus: tab.editor.setStatus,
    onRemark: tab.editor.setRemark,
    onCorrect: tab.canCorrect ? (row) => correction.show(row) : undefined,
  });

  return { tab, columns, correction };
}
