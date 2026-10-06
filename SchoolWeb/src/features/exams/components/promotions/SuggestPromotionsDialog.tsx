"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { usePromotionSuggestForm } from "../../use-promotion-suggest-form";
import type { PromotionsTabState } from "../../use-promotions-tab";
import { ExamChecklistField } from "./ExamChecklistField";

export function SuggestPromotionsDialog({ tab }: { tab: PromotionsTabState }) {
  const suggest = usePromotionSuggestForm(tab);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && tab.dialogs.suggest.close()}
      title="Suggest promotions"
      description="Decisions are built for every student from the selected published results and the branch pass rules. Existing suggestions that are not confirmed are rebuilt."
      submitLabel="Build suggestions"
      submitting={suggest.submitting}
      onSubmit={suggest.submit}
      form={suggest.form}
      error={suggest.formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="fromSessionId" label="From session" options={suggest.sessionOptions} required />
        <SelectField name="toSessionId" label="To session" options={suggest.sessionOptions} required />
      </div>
      <ExamChecklistField
        name="examIds"
        label="Published exams"
        options={suggest.examOptions}
        loading={suggest.examsLoading}
        emptyText="No published exams in this session yet. Results must be published before promotion."
      />
    </FormDialog>
  );
}
