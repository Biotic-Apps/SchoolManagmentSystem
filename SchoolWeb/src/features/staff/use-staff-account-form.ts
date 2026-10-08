import { useWatch } from "react-hook-form";
import { useServerForm } from "@/lib/use-server-form";
import { staffAccountDefaults, staffAccountSchema, toStaffAccountInput, type StaffAccountValues } from "./account-schemas";
import { useCreateStaffAccount } from "./api";
import type { StaffAccount, StaffDetail } from "./types";

/** Create-sign-in form for a staff member who has no login yet. */
export function useStaffAccountForm(staff: StaffDetail, onCreated: (account: StaffAccount) => void) {
  const create = useCreateStaffAccount(staff.id);
  const server = useServerForm<StaffAccountValues, StaffAccount>({
    schema: staffAccountSchema,
    defaultValues: staffAccountDefaults(staff),
    onSubmit: (values) => create.mutateAsync(toStaffAccountInput(values)),
    onSuccess: onCreated,
    conflictField: "email",
  });
  const setPassword = useWatch({ control: server.form.control, name: "setPassword" });
  return { ...server, setPassword };
}
