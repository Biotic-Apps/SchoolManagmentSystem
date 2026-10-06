"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { TOPIC_STATUS_OPTIONS } from "../options";
import type { Topic } from "../types";
import { useTopicProgressForm } from "../use-topic-progress-form";

export function TopicProgressDialog({ topic, onClose }: { topic: Topic; onClose: () => void }) {
  const { form, submit, submitting, formError, showCompletedOn } = useTopicProgressForm(topic, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Update topic progress"
      description={topic.title}
      submitLabel="Update"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <SelectField name="status" label="Status" options={TOPIC_STATUS_OPTIONS} required />
      {showCompletedOn && <TextField name="completedOn" label="Completed on" type="date" required />}
      <TextareaField name="note" label="Note" placeholder="Optional, e.g. covered with an extra worksheet" />
    </FormDialog>
  );
}
