import { useWatch } from "react-hook-form";
import { toIsoDate } from "@/lib/dates";
import { useServerForm } from "@/lib/use-server-form";
import { statusSchema, toStatusInput, type StatusFormValues } from "./action-schemas";
import { useStaffStatus } from "./api";
import { LEAVING_STATUSES, STAFF_STATUS_OPTIONS } from "./options";
import type { StaffDetail, StaffStatus } from "./types";

export function useStatusForm(staff: StaffDetail, onDone: () => void) {
  const change = useStaffStatus(staff.id);
  const server = useServerForm<StatusFormValues>({
    schema: statusSchema,
    defaultValues: { status: "", effectiveDate: toIsoDate(new Date()), reason: "" },
    onSubmit: (values) => change.mutateAsync(toStatusInput(values)),
    onSuccess: onDone,
  });
  const status = useWatch({ control: server.form.control, name: "status" });

  return {
    ...server,
    statusOptions: STAFF_STATUS_OPTIONS.filter((option) => option.id !== staff.status),
    /** Leaving disables the sign-in account and ends all assignments. */
    leaving: LEAVING_STATUSES.includes(status as StaffStatus),
  };
}
