"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { newClassRow } from "../class-rows";
import type { SetupFormValues } from "../schemas";
import { ClassRowEditor } from "./ClassRowEditor";
import { SubjectMatrix } from "./SubjectMatrix";

/** Classes with their own sections, plus the class × subject matrix. */
export function ClassesStep() {
  const { control, formState } = useFormContext<SetupFormValues>();
  const createSession = useWatch({ control, name: "academics.createSession" });
  const rows = useFieldArray({ control, name: "academics.classes" });
  const [matrixFor, setMatrixFor] = useState<number | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);
  const [name, setName] = useState("");
  const listError = formState.errors.academics?.classes?.message ?? formState.errors.academics?.classes?.root?.message;

  if (!createSession)
    return <InlineNotice>Classes are added with the academic year. Go back one step and tick “Set up the academic year now”, or skip this.</InlineNotice>;

  const addClass = () => {
    if (!name.trim()) return;
    rows.append(newClassRow(name.trim(), "CUSTOM", true));
    setName("");
  };

  return (
    <div className="flex flex-col gap-4">
      {listError && (
        <p role="alert" className="text-label text-error">
          {listError}
        </p>
      )}
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => setShowMatrix((open) => !open)}>
          {showMatrix ? "Hide subjects table" : "Edit subjects for all classes"}
        </Button>
      </div>
      {showMatrix && <SubjectMatrix focusClass={matrixFor} />}
      <ul className="flex flex-col gap-2">
        {rows.fields.map((field, index) => (
          <ClassRowEditor
            key={field.id}
            index={index}
            onEditSubjects={() => {
              setMatrixFor(index);
              setShowMatrix(true);
            }}
          />
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addClass();
            }
          }}
          placeholder="Another class, e.g. O Level 1"
          aria-label="New class name"
          className="h-10 max-w-64"
        />
        <Button variant="secondary" onClick={addClass}>
          <Plus />
          Add class
        </Button>
      </div>
    </div>
  );
}
