import { useWatch } from "react-hook-form";
import { useSession } from "@/features/auth/session-context";
import { useCan } from "@/features/auth/use-can";
import { useServerForm } from "@/lib/use-server-form";
import { useSaveRole } from "./api";
import { roleEditRights, roleReadOnlyNotice } from "./role-rights";
import { customRoleKeyPreview, roleFormDefaults, roleSchema, toRoleInput, type RoleFormValues } from "./schemas";
import type { Role } from "./types";

export function useRoleForm(role: Role | null, onDone: () => void) {
  const { session } = useSession();
  const canEdit = useCan()("roles.edit");
  const save = useSaveRole();
  const rights = roleEditRights(role, canEdit, session?.activeRole);
  const readOnly = !rights.name && !rights.permissions;

  const result = useServerForm<RoleFormValues>({
    schema: roleSchema,
    defaultValues: roleFormDefaults(role),
    onSubmit: (values) =>
      readOnly ? Promise.resolve(null) : save.mutateAsync({ id: role?.id, input: toRoleInput(values, role, rights) }),
    onSuccess: onDone,
    conflictField: "name",
  });

  const name = useWatch({ control: result.form.control, name: "name" });
  const keyHint = role ? `Key ${role.key} can't be changed.` : `Key will be ${customRoleKeyPreview(name)}`;

  return { ...result, rights, readOnly, keyHint, notice: roleReadOnlyNotice(role, rights, canEdit) };
}
