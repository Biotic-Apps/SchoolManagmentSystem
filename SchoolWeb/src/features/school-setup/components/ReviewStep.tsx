"use client";

import { Sparkles } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { academicRows, branchRows, creationSentence, principalRows, schoolRows } from "../summary";
import type { SetupFormValues } from "../schemas";
import { ReviewSection } from "./ReviewSection";

export function ReviewStep({ onEdit }: { onEdit: (step: number) => void }) {
  const values = useFormContext<SetupFormValues>().getValues();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-input bg-selected px-4 py-3 text-on-selected">
        <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p className="text-label">
          <span className="font-semibold">This will create: </span>
          {creationSentence(values)}.
        </p>
      </div>
      <ReviewSection title="School" rows={schoolRows(values)} onEdit={() => onEdit(0)} />
      <ReviewSection title="Main branch" rows={branchRows(values)} onEdit={() => onEdit(1)} />
      <ReviewSection title="Principal" rows={principalRows(values)} onEdit={() => onEdit(2)} />
      <ReviewSection title="Academic year" rows={academicRows(values)} onEdit={() => onEdit(2)} />
    </div>
  );
}
