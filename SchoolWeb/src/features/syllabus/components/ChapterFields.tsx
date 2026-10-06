"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import { emptyChapter, type PlanValues } from "../schemas";
import { OrderButtons } from "@/components/shared/OrderButtons";
import { TopicRows } from "./TopicRows";

/** Chapters in teaching order; each holds its topics with target dates. */
export function ChapterFields() {
  const { control, formState } = useFormContext<PlanValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "chapters" });
  const listError = formState.errors.chapters?.root?.message ?? formState.errors.chapters?.message;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-label font-medium text-fg">Chapters and topics</legend>
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-3 rounded-input border border-border p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start">
            <TextField name={`chapters.${index}.title`} label={`Chapter ${index + 1}`} required className="flex-1" />
            <div className="md:pt-7">
              <OrderButtons
                label={`chapter ${index + 1}`}
                index={index}
                count={fields.length}
                onMove={move}
                onRemove={fields.length > 1 ? () => remove(index) : undefined}
              />
            </div>
          </div>
          <TopicRows chapterIndex={index} />
        </div>
      ))}
      {listError && (
        <p role="alert" className="text-caption text-error">
          {listError}
        </p>
      )}
      <Button variant="secondary" size="sm" className="self-start" onClick={() => append(emptyChapter())}>
        <Plus />
        Add chapter
      </Button>
    </fieldset>
  );
}
