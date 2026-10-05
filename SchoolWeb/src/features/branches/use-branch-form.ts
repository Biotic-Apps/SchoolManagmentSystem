import { useServerForm } from "@/lib/use-server-form";
import { useSaveBranch } from "./api";
import { branchFormDefaults, branchSchema, toBranchInput, type BranchFormValues } from "./schemas";
import type { Branch } from "./types";

export function useBranchForm(branch: Branch | null, defaultSchoolId: string | null, onDone: () => void) {
  const save = useSaveBranch();
  return useServerForm<BranchFormValues>({
    schema: branchSchema,
    defaultValues: branchFormDefaults(branch, defaultSchoolId),
    onSubmit: (values) => save.mutateAsync({ id: branch?.id, input: toBranchInput(values, !!branch) }),
    onSuccess: onDone,
    conflictField: "code",
  });
}
