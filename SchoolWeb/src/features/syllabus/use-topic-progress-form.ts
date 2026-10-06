import { useWatch } from "react-hook-form";
import { useServerForm } from "@/lib/use-server-form";
import { notifyProgressResult, useTopicProgress } from "./api";
import { toTopicProgressInput, topicProgressDefaults, topicProgressSchema, type TopicProgressValues } from "./schemas";
import type { Topic, TopicProgressResult } from "./types";

/** Teachers on probation get PENDING_REVIEW back; notifyProgressResult tells them it awaits review. */
export function useTopicProgressForm(topic: Topic, onDone: () => void) {
  const progress = useTopicProgress();
  const server = useServerForm<TopicProgressValues, TopicProgressResult>({
    schema: topicProgressSchema,
    defaultValues: topicProgressDefaults(topic),
    onSubmit: (values) => progress.mutateAsync({ topicId: topic.id, input: toTopicProgressInput(values) }),
    onSuccess: (result) => {
      notifyProgressResult(result);
      onDone();
    },
  });
  const status = useWatch({ control: server.form.control, name: "status" });
  return { ...server, showCompletedOn: status === "COMPLETED" };
}
