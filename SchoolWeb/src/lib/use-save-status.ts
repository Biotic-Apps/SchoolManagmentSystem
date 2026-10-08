import { useIsMutating, useMutationState, type QueryKey } from "@tanstack/react-query";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/** Autosave state of every mutation started with `mutationKey`: saving while any runs, then the last outcome. */
export function useSaveStatus(mutationKey: QueryKey): SaveStatus {
  const pending = useIsMutating({ mutationKey });
  const statuses = useMutationState({ filters: { mutationKey }, select: (mutation) => mutation.state.status });
  if (pending > 0) return "saving";
  const last = statuses.at(-1);
  if (last === "success") return "saved";
  if (last === "error") return "error";
  return "idle";
}
