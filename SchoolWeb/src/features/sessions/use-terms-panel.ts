import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { useTerms } from "./api";
import { termColumns } from "./term-columns";
import type { AcademicSession, Term } from "./types";

export function useTermsPanel(session: AcademicSession | null) {
  const can = useCan();
  const query = useTerms(session?.id ?? null);
  const form = useDialogState<Term>();
  const deleteTarget = useDialogState<Term>();

  const editable = !!session && session.status !== "CLOSED" && can("sessions.edit");

  const columns = useMemo(
    () =>
      termColumns({
        onEdit: editable ? form.show : undefined,
        onDelete: editable ? deleteTarget.show : undefined,
      }),
    [editable, form.show, deleteTarget.show],
  );

  const terms = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [query.data],
  );

  return { query, terms, columns, editable, form, deleteTarget };
}
