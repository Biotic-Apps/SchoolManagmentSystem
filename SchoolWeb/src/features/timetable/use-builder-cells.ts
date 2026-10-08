import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorWithDetails } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { timetableKeys } from "./api";
import { builderSaveKey, deleteCell, putCell, type CellTarget } from "./builder-api";
import { withCell, withCellResult } from "./builder-cache";
import type { CellInput, CellResult, TimetableBuilder } from "./builder-types";
import type { Slot } from "./types";

interface CellChange {
  target: CellTarget;
  /** null removes the lesson. */
  input: CellInput | null;
  /** What the grid shows right away. */
  slot: Slot | null;
}

/**
 * Autosave of single cells: the grid changes at once, the server answer adds conflicts and counts,
 * and a failure puts the cell back with the reason in a toast.
 */
export function useBuilderCells(sectionId: string) {
  const queryClient = useQueryClient();
  const key = timetableKeys.builder(sectionId);

  const mutation = useMutation<CellResult, unknown, CellChange, { previous?: TimetableBuilder }>({
    mutationKey: builderSaveKey(sectionId),
    mutationFn: ({ target, input }) => (input ? putCell(sectionId, target, input) : deleteCell(sectionId, target)),
    onMutate: async ({ target, slot }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TimetableBuilder>(key);
      if (previous) queryClient.setQueryData(key, withCell(previous, target, slot));
      return { previous };
    },
    onSuccess: (result, { target }) => {
      const current = queryClient.getQueryData<TimetableBuilder>(key);
      if (current && result) queryClient.setQueryData(key, withCellResult(current, target, result));
    },
    onError: (error, _change, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(errorWithDetails(error));
    },
    onSettled: () => {
      // Other sections' "busy" lists and the class cards depend on this draft too.
      void queryClient.invalidateQueries({ queryKey: ["timetable", "builder"] });
      void queryClient.invalidateQueries({ queryKey: ["classes", "overview"] });
      void queryClient.invalidateQueries({ queryKey: ["teaching-staff"] });
    },
  });

  return {
    save: (target: CellTarget, input: CellInput, slot: Slot) => mutation.mutate({ target, input, slot }),
    clear: (target: CellTarget) => mutation.mutate({ target, input: null, slot: null }),
  };
}
