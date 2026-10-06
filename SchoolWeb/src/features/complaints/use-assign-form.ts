import type { Option } from "@/components/shared/OptionSelect";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { useStaffOptions } from "@/features/staff/api";
import { useServerForm } from "@/lib/use-server-form";
import { useAssignComplaint } from "./api";
import { assignSchema } from "./schemas";
import type { Complaint } from "./types";

/** Assignee picker: active staff of the branch who have a login (assignment is by user id). */
export function useAssignForm(complaint: Complaint, onDone: () => void) {
  const branch = useBranchPicker();
  const staff = useStaffOptions(branch.branchId);
  const assign = useAssignComplaint(complaint.id);

  const { form, submit, submitting, formError } = useServerForm({
    schema: assignSchema,
    defaultValues: { assigneeUserId: "" },
    onSubmit: (values) => assign.mutateAsync(values.assigneeUserId),
    onSuccess: onDone,
  });

  // A complaint about someone is never routed to them.
  const options: Option[] = staff.staff
    .filter((member) => !!member.userId && member.userId !== complaint.against?.id)
    .map((member) => ({ id: member.userId as string, name: `${member.name} · ${member.designation}` }));

  return { form, submit, submitting, formError, branch, options, loading: staff.isLoading };
}
