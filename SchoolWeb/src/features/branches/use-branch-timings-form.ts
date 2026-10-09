import { useServerForm } from "@/lib/use-server-form";
import { useSaveBranchTimings } from "./api";
import {
  branchTimingDefaults,
  branchTimingsSchema,
  toTimingsInput,
  type BranchTimingsFormValues,
} from "./timings-schema";
import type { Branch } from "./types";

/** Principal's form: only timings and working days of their own branch. */
export function useBranchTimingsForm(branch: Branch, onDone: () => void) {
  const save = useSaveBranchTimings(branch.id);
  return useServerForm<BranchTimingsFormValues>({
    schema: branchTimingsSchema,
    defaultValues: branchTimingDefaults(branch),
    onSubmit: (values) => save.mutateAsync(toTimingsInput(values)),
    onSuccess: onDone,
  });
}
