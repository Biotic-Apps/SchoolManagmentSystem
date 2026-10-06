import { useWatch } from "react-hook-form";
import { useSectionOptions } from "@/features/classes/sections-api";
import { useServerForm } from "@/lib/use-server-form";
import { acceptTransferSchema, type AcceptTransferValues } from "./action-schemas";
import { useAcceptTransfer } from "./transfers-api";
import type { Transfer } from "./types";

/** Places an incoming transfer into a section of this branch's session. */
export function useAcceptTransferForm(transfer: Transfer, branchId: string, sessionId: string, onDone: () => void) {
  const accept = useAcceptTransfer();
  const sections = useSectionOptions(branchId, sessionId);
  const server = useServerForm<AcceptTransferValues>({
    schema: acceptTransferSchema,
    defaultValues: { sectionId: "" },
    onSubmit: (values) => accept.mutateAsync({ id: transfer.id, sectionId: values.sectionId }),
    onSuccess: onDone,
  });
  const sectionId = useWatch({ control: server.form.control, name: "sectionId" });
  return { ...server, sections, sectionFull: !!sectionId && sections.isFull(sectionId) };
}
