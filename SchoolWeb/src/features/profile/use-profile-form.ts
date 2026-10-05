import { useSession } from "@/features/auth/session-context";
import type { SessionUser } from "@/features/auth/types";
import { toast } from "@/lib/toast";
import { useServerForm } from "@/lib/use-server-form";
import { updateMe } from "./api";
import { conflictToField } from "./conflict-field";
import { profileFormDefaults, profileSchema, toProfileInput, type ProfileFormValues } from "./schemas";

export function useProfileForm() {
  const { session, updateUser } = useSession();

  const result = useServerForm<ProfileFormValues, SessionUser>({
    schema: profileSchema,
    defaultValues: profileFormDefaults(session?.user),
    onSubmit: async (values) => {
      try {
        return await updateMe(toProfileInput(values));
      } catch (error) {
        throw conflictToField(error);
      }
    },
    onSuccess: (user) => {
      updateUser(user);
      result.form.reset(profileFormDefaults(user));
      toast.success("Your details were updated");
    },
  });

  return { ...result, dirty: result.form.formState.isDirty };
}
