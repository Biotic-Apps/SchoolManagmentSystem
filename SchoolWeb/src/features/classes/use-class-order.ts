import { useState } from "react";
import { useReorderClasses } from "./overview-api";
import type { ClassOverview } from "./setup-types";

/** Reorder mode: a local copy of the class order, saved in one call. */
export function useClassOrder(classes: ClassOverview[]) {
  const [draft, setDraft] = useState<ClassOverview[] | null>(null);
  const save = useReorderClasses();

  const move = (from: number, to: number) =>
    setDraft((current) => {
      const list = [...(current ?? classes)];
      if (to < 0 || to >= list.length) return list;
      const [item] = list.splice(from, 1);
      list.splice(to, 0, item);
      return list;
    });

  return {
    active: draft !== null,
    items: draft ?? classes,
    start: () => setDraft(classes),
    cancel: () => setDraft(null),
    move,
    saving: save.isPending,
    save: async () => {
      if (!draft) return;
      try {
        await save.mutateAsync(draft.map((item) => item.id));
        setDraft(null);
      } catch {
        // toasted; keep the draft so the user can retry
      }
    },
  };
}
