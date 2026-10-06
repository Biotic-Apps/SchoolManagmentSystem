import { useMarkFollowUpDone, useFollowUps } from "./api";

export function useMyFollowUps() {
  const query = useFollowUps({ mine: true, status: "OPEN" });
  const done = useMarkFollowUpDone();
  return {
    query,
    items: [...(query.data ?? [])].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    markDone: (id: string) => done.mutate(id),
    pendingId: done.isPending ? done.variables : undefined,
  };
}
