import { useServerForm } from "@/lib/use-server-form";
import { useUpdateUser } from "./api";
import { editUserDefaults, editUserSchema, toUpdateUserInput, type EditUserValues } from "./schemas";
import type { UserSummary } from "./types";

export function useEditUserForm(user: UserSummary, onDone: () => void) {
  const update = useUpdateUser(user.id);
  return useServerForm<EditUserValues>({
    schema: editUserSchema,
    defaultValues: editUserDefaults(user),
    onSubmit: (values) => update.mutateAsync(toUpdateUserInput(values)),
    onSuccess: onDone,
  });
}
