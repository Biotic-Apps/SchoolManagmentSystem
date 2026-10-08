import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { classSetupHref } from "./links";
import { useClassesOverview } from "./overview-api";
import type { SchoolClass } from "./types";
import { useClassOrder } from "./use-class-order";

/** Classes tab: one card per class, reorder mode, and "Add class" that continues to Class setup. */
export function useClassesOverviewTab(branchId: string, sessionId: string | null) {
  const router = useRouter();
  const can = useCan();
  const query = useClassesOverview(branchId, sessionId);
  const classes = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => a.levelOrder - b.levelOrder || a.name.localeCompare(b.name)),
    [query.data],
  );
  const order = useClassOrder(classes);
  const addDialog = useDialogState<true>();
  const nextLevel = classes.reduce((max, item) => Math.max(max, item.levelOrder), 0) + 1;

  const open = (classId: string) => router.push(classSetupHref(classId, branchId, sessionId));

  return {
    query,
    classes,
    order,
    addDialog,
    nextLevel,
    canAdd: can("classes.add"),
    canReorder: can("classes.edit") && classes.length > 1,
    open,
    onCreated: (created: SchoolClass) => {
      addDialog.close();
      open(created.id);
    },
  };
}
