import { useServerForm } from "@/lib/use-server-form";
import { useUpdateStaff } from "./api";
import { editStaffDefaults, editStaffSchema, toStaffUpdate, type EditStaffValues } from "./schemas";
import type { StaffDetail } from "./types";

export function useEditStaffForm(staff: StaffDetail, onDone: () => void) {
  const update = useUpdateStaff(staff.id);
  return useServerForm<EditStaffValues>({
    schema: editStaffSchema,
    defaultValues: editStaffDefaults(staff),
    onSubmit: (values) => update.mutateAsync(toStaffUpdate(values)),
    onSuccess: onDone,
  });
}
