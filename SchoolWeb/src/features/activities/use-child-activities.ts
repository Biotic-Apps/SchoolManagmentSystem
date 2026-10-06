import { useActiveChild } from "@/features/auth/use-active-child";
import { useDialogState } from "@/lib/use-dialog-state";
import { useMyActivities, useRespondConsent } from "./api";
import type { MyActivity } from "./types";

/** PARENT: upcoming activities of the Topbar child, with consent responses. */
export function useChildActivities() {
  const child = useActiveChild();
  const query = useMyActivities(child?.id ?? null);
  const respond = useRespondConsent();
  const declining = useDialogState<MyActivity>();
  const activities = [...(query.data ?? [])].sort((a, b) => a.startAt.localeCompare(b.startAt));

  return {
    child,
    query,
    activities,
    pendingId: respond.isPending ? respond.variables?.id : undefined,
    grant: (activity: MyActivity) =>
      child && respond.mutate({ id: activity.id, studentId: child.id, decision: "GRANTED" }),
    declining,
    confirmDecline: (note: string) => {
      if (!child || !declining.item) return;
      respond.mutate(
        { id: declining.item.id, studentId: child.id, decision: "DECLINED", note: note || undefined },
        { onSuccess: declining.close },
      );
    },
    declinePending: respond.isPending && respond.variables?.decision === "DECLINED",
  };
}
