import { useWatch } from "react-hook-form";
import { todayIso } from "@/lib/dates";
import { useServerForm } from "@/lib/use-server-form";
import { useSaveActivity } from "./api";
import { activityDefaults, activitySchema, toActivityInput, type ActivityFormValues } from "./schemas";
import type { Activity } from "./types";

/** Propose a new activity, or edit one while it is still PROPOSED. */
export function useActivityForm(activity: Activity | null, branchId: string, onDone: () => void) {
  const save = useSaveActivity();
  const server = useServerForm<ActivityFormValues, Activity>({
    schema: activitySchema,
    defaultValues: activityDefaults(activity, todayIso()),
    onSubmit: (values) => save.mutateAsync({ id: activity?.id, input: toActivityInput(values, branchId) }),
    onSuccess: onDone,
  });
  const [wholeBranch, consentRequired] = useWatch({
    control: server.form.control,
    name: ["wholeBranch", "consentRequired"],
  });
  return { ...server, wholeBranch, consentRequired };
}
