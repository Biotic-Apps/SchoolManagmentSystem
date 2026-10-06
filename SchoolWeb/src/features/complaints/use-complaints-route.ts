import { useState } from "react";
import { useSession } from "@/features/auth/session-context";
import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import type { ComplaintBox } from "./types";

/** Roles that see every complaint in their scope; others hold complaints.view only for the menu. */
const BRANCH_WIDE_ROLES = new Set(["PRINCIPAL", "SUPER_ADMIN", "COORDINATOR", "HEAD_TEACHER"]);

export interface OpenComplaint {
  id: string;
  box: ComplaintBox;
}

export function useComplaintsRoute() {
  const can = useCan();
  const role = useSession().session?.activeRole ?? "";
  const boxes: ComplaintBox[] = ["mine"];
  if (role !== "PARENT") boxes.push("assigned");
  if (can("complaints.view") && BRANCH_WIDE_ROLES.has(role)) boxes.push("all");

  const [box, setBox] = useState<ComplaintBox>("mine");
  const [open, setOpen] = useState<OpenComplaint | null>(null);
  const form = useDialogState<true>();
  const activeBox = boxes.includes(box) ? box : "mine";

  return {
    boxes,
    box: activeBox,
    setBox: (value: string) => setBox(value as ComplaintBox),
    open,
    openComplaint: (id: string) => setOpen({ id, box: activeBox }),
    closeComplaint: () => setOpen(null),
    form,
  };
}
