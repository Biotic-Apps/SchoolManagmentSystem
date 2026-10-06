import { toast } from "@/lib/toast";
import { useServerForm } from "@/lib/use-server-form";
import { disableTwoFactor } from "./two-factor-api";
import { disableTwoFactorSchema, type DisableTwoFactorValues } from "./two-factor-schemas";

export function useDisableTwoFactorForm(onDone: () => void) {
  return useServerForm<DisableTwoFactorValues>({
    schema: disableTwoFactorSchema,
    defaultValues: { password: "", code: "" },
    onSubmit: ({ password, code }) => disableTwoFactor(password, code.replace(/\s/g, "")),
    onSuccess: () => {
      toast.success("Two-step sign-in is off");
      onDone();
    },
  });
}
