import { useWatch } from "react-hook-form";
import { useServerForm } from "@/lib/use-server-form";
import { useCreateStaff } from "./api";
import { STAFF_DEFAULTS, staffSchema, toStaffInput, type StaffFormValues } from "./schemas";
import type { CreatedStaff } from "./types";

/** Add-staff form; the sign-in role only shows when an account is created. */
export function useStaffForm(branchId: string, onCreated: (created: CreatedStaff) => void) {
  const create = useCreateStaff();
  const server = useServerForm<StaffFormValues, CreatedStaff>({
    schema: staffSchema,
    defaultValues: STAFF_DEFAULTS,
    onSubmit: (values) => create.mutateAsync(toStaffInput(values, branchId)),
    onSuccess: onCreated,
  });
  const createAccount = useWatch({ control: server.form.control, name: "createAccount" });
  return { ...server, createAccount };
}
