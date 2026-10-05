import { z } from "zod";
import { useServerForm } from "@/lib/use-server-form";
import { useChangePrincipal } from "./api";
import type { Branch } from "./types";

const principalSchema = z.object({ userId: z.string().min(1, "Pick the new principal") });

type PrincipalFormValues = z.infer<typeof principalSchema>;

export function useChangePrincipalForm(branch: Branch, onDone: () => void) {
  const change = useChangePrincipal();
  return useServerForm<PrincipalFormValues>({
    schema: principalSchema,
    defaultValues: { userId: branch.principal?.id ?? "" },
    onSubmit: ({ userId }) => change.mutateAsync({ branchId: branch.id, userId }),
    onSuccess: onDone,
  });
}
