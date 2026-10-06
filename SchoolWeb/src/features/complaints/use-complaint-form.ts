import type { Option } from "@/components/shared/OptionSelect";
import { useSession } from "@/features/auth/session-context";
import { useActiveChild, useIsParent } from "@/features/auth/use-active-child";
import { useServerForm } from "@/lib/use-server-form";
import { useCreateComplaint } from "./api";
import { complaintDefaults, complaintSchema, toComplaintInput } from "./schemas";
import type { Complaint } from "./types";

export function useComplaintForm(onSaved: (complaint: Complaint) => void) {
  const { session } = useSession();
  const isParent = useIsParent();
  const child = useActiveChild();
  const create = useCreateComplaint();

  const { form, submit, submitting, formError } = useServerForm({
    schema: complaintSchema,
    defaultValues: complaintDefaults(child?.id),
    onSubmit: (values) => create.mutateAsync(toComplaintInput(values)),
    onSuccess: (complaint) => onSaved(complaint),
  });

  const childOptions: Option[] = (session?.children ?? []).map((item) => ({ id: item.id, name: item.name }));

  return { form, submit, submitting, formError, isParent, childOptions };
}
