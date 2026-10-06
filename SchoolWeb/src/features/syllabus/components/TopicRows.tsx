"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import { EMPTY_TOPIC, type PlanValues } from "../schemas";
import { OrderButtons } from "@/components/shared/OrderButtons";

export function TopicRows({ chapterIndex }: { chapterIndex: number }) {
  const { control, formState } = useFormContext<PlanValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: `chapters.${chapterIndex}.topics` });
  const topicsError = formState.errors.chapters?.[chapterIndex]?.topics;
  const listError = topicsError?.root?.message ?? topicsError?.message;
  const chapterNo = chapterIndex + 1;

  return (
    <div className="flex flex-col gap-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-2 border-l-2 border-border pl-3 md:flex-row md:items-start">
          <TextField
            name={`chapters.${chapterIndex}.topics.${index}.title`}
            label={`Topic ${index + 1}`}
            required
            className="flex-1"
          />
          <TextField
            name={`chapters.${chapterIndex}.topics.${index}.targetDate`}
            label="Target date"
            type="date"
            required
            className="md:w-44"
          />
          <div className="md:pt-7">
            <OrderButtons
              label={`topic ${index + 1} of chapter ${chapterNo}`}
              index={index}
              count={fields.length}
              onMove={move}
              onRemove={fields.length > 1 ? () => remove(index) : undefined}
            />
          </div>
        </div>
      ))}
      {listError && (
        <p role="alert" className="text-caption text-error">
          {listError}
        </p>
      )}
      <Button variant="ghost" size="sm" className="self-start" onClick={() => append({ ...EMPTY_TOPIC })}>
        <Plus />
        Add topic
      </Button>
    </div>
  );
}
