import { useServerForm } from "@/lib/use-server-form";
import { toast } from "@/lib/toast";
import { changePassword } from "./api";
import { changePasswordSchema, type ChangePasswordValues } from "./schemas";

const EMPTY: ChangePasswordValues = { currentPassword: "", newPassword: "", confirmPassword: "" };

export function useChangePasswordForm(onDone?: () => void) {
  const result = useServerForm<ChangePasswordValues>({
    schema: changePasswordSchema,
    defaultValues: EMPTY,
    onSubmit: changePassword,
    onSuccess: () => {
      toast.success("Password changed. Other devices were signed out.");
      result.form.reset(EMPTY);
      onDone?.();
    },
  });
  return result;
}
