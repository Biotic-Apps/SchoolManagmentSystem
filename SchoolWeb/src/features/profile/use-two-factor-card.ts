import { useState } from "react";
import { useSession } from "@/features/auth/session-context";
import { toast } from "@/lib/toast";
import { useServerForm } from "@/lib/use-server-form";
import { enableTwoFactor, useStartTwoFactorSetup, type TwoFactorSetup } from "./two-factor-api";
import { enableTwoFactorSchema, type EnableTwoFactorValues } from "./two-factor-schemas";

export function useTwoFactorCard() {
  const { session, updateUser } = useSession();
  const start = useStartTwoFactorSetup();
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [disableOpen, setDisableOpen] = useState(false);

  const enableForm = useServerForm<EnableTwoFactorValues, string[]>({
    schema: enableTwoFactorSchema,
    defaultValues: { code: "" },
    onSubmit: ({ code }) => enableTwoFactor(code.replace(/\s/g, "")),
    onSuccess: (codes) => {
      setSetup(null);
      enableForm.form.reset({ code: "" });
      updateUser({ twoFactorEnabled: true });
      setRecoveryCodes(codes);
      toast.success("Two-step sign-in is on");
    },
  });

  const user = session?.user;
  return {
    enabled: !!user?.twoFactorEnabled,
    required: !!user?.twoFactorRequired,
    account: user?.email ?? user?.phone ?? user?.name ?? "",
    setup,
    starting: start.isPending,
    beginSetup: () => start.mutate(undefined, { onSuccess: setSetup }),
    cancelSetup: () => setSetup(null),
    enableForm,
    recoveryCodes,
    closeRecoveryCodes: () => setRecoveryCodes(null),
    disableOpen,
    setDisableOpen,
    onDisabled: () => {
      setDisableOpen(false);
      updateUser({ twoFactorEnabled: false });
    },
  };
}
