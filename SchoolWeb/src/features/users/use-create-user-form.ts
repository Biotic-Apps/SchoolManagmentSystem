import { useServerForm } from "@/lib/use-server-form";
import { useCreateUser } from "./api";
import { EMPTY_ASSIGNMENT, createUserSchema, toCreateUserInput, type CreateUserValues } from "./schemas";
import type { CreatedUser } from "./types";

const DEFAULTS: CreateUserValues = { name: "", email: "", phone: "", password: "", assignments: [EMPTY_ASSIGNMENT] };

/** On success hands back the created user (with its one-time temporary password, if generated). */
export function useCreateUserForm(onCreated: (user: CreatedUser) => void) {
  const create = useCreateUser();
  return useServerForm<CreateUserValues, CreatedUser>({
    schema: createUserSchema,
    defaultValues: DEFAULTS,
    onSubmit: (values) => create.mutateAsync(toCreateUserInput(values)),
    onSuccess: onCreated,
  });
}
