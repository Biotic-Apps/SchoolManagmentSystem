import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useCloseIncident } from "./api";
import type { IncidentDetail } from "./types";

export function useCloseIncidentAction(incident: IncidentDetail | null) {
  const can = useCan();
  const close = useCloseIncident();
  const [open, setOpen] = useState(false);

  return {
    canClose: can("health.edit") && !!incident && incident.status !== "CLOSED",
    open,
    setOpen,
    submitting: close.isPending,
    confirm: (note: string) => {
      if (!incident) return;
      close.mutate({ id: incident.id, note: note || undefined }, { onSuccess: () => setOpen(false) });
    },
  };
}
