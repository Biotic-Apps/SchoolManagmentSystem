"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { MonthField } from "@/components/shared/form/MonthField";
import { SelectField } from "@/components/shared/form/SelectField";
import type { PrintChallansJob } from "../../challan-print";
import { usePrintChallansForm } from "../../use-print-challans-form";

interface PrintChallansDialogProps {
  branchId: string;
  sessionId: string | null;
  period: string;
  classId?: string;
  classOptions: Option[];
  onStarted: (job: PrintChallansJob) => void;
  onClose: () => void;
}

/** Bulk print: one PDF with a bank / school / parent challan page per unpaid invoice. */
export function PrintChallansDialog({
  branchId,
  sessionId,
  period,
  classId,
  classOptions,
  onStarted,
  onClose,
}: PrintChallansDialogProps) {
  const { form, submit, submitting, formError, chosenClass, sectionOptions } = usePrintChallansForm(
    { branchId, sessionId, period, classId },
    (job) => {
      onStarted(job);
      onClose();
    },
  );

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Print challans"
      description="One PDF with every unpaid issued invoice of the month. Each page has the bank, school and parent copies with the due-date and late-fee amounts."
      submitLabel="Prepare PDF"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <MonthField name="period" label="Billing month" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="classId"
          label="Class"
          options={classOptions}
          emptyLabel="All classes"
          placeholder="All classes"
        />
        <SelectField
          name="sectionId"
          label="Section"
          options={sectionOptions}
          emptyLabel="All sections"
          placeholder="All sections"
          disabled={!chosenClass}
          hint={chosenClass ? undefined : "Choose a class to print one section."}
        />
      </div>
    </FormDialog>
  );
}
