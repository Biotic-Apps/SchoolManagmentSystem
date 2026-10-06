import { FormSection } from "@/components/shared/FormSection";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { TextField } from "@/components/shared/form/TextField";
import { TimeField } from "@/components/shared/form/TimeField";
import { ApprovalLimitsFields } from "./ApprovalLimitsFields";

export function DefaultsPolicySection() {
  return (
    <FormSection
      title="School defaults"
      description="Used by every branch unless it sets its own. Branch settings still override per branch."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TimeField
          name="attendanceLockTime"
          label="Attendance locks at"
          hint="After this time changes need a correction request."
          required
        />
        <TextField name="gradingDefault" label="Default grading scale" hint="Leave blank to have no default." maxLength={60} />
      </div>
      <CheckboxField
        name="diaryModeration"
        label="Moderate diary entries"
        hint="Teachers' diary entries wait for approval before parents see them."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField name="lateFeeAmount" label="Late fee" hint="Leave blank for no late fee." />
        <TextField
          name="lateFeeAfterDays"
          label="Charged after (days past due)"
          inputMode="numeric"
          autoComplete="off"
          inputClassName="text-right tabular-nums"
        />
      </div>
      <ApprovalLimitsFields />
    </FormSection>
  );
}
