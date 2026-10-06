"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { Option } from "@/components/shared/OptionSelect";
import { Button } from "@/components/ui/Button";
import { EMPTY_BOOK, type BookListValues } from "../schemas";
import { BookItemRow } from "./BookItemRow";

export function BookItemsFields({ subjectOptions }: { subjectOptions: Option[] }) {
  const { control, formState } = useFormContext<BookListValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const listError = formState.errors.items?.root?.message ?? formState.errors.items?.message;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-label font-medium text-fg">Books</legend>
      {fields.map((field, index) => (
        <BookItemRow
          key={field.id}
          prefix={`items.${index}`}
          index={index}
          subjectOptions={subjectOptions}
          onRemove={fields.length > 1 ? () => remove(index) : undefined}
        />
      ))}
      {listError && (
        <p role="alert" className="text-caption text-error">
          {listError}
        </p>
      )}
      <Button variant="secondary" size="sm" className="self-start" onClick={() => append({ ...EMPTY_BOOK })}>
        <Plus />
        Add book
      </Button>
    </fieldset>
  );
}
