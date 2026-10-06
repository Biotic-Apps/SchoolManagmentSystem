"use client";

import { DetailList } from "@/components/shared/DetailList";
import { FormDialog } from "@/components/shared/FormDialog";
import { MoneyText } from "@/components/shared/MoneyText";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { formatDate } from "@/lib/format";
import { useCollectionCloseForm } from "../../use-collection-close-form";

interface CloseDayDialogProps {
  branchId: string;
  date: string;
  expectedCashMinor: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloseDayDialog(props: CloseDayDialogProps) {
  if (!props.open) return null;
  return <CloseDayForm {...props} />;
}

function CloseDayForm({ branchId, date, expectedCashMinor, onOpenChange }: CloseDayDialogProps) {
  const close = useCollectionCloseForm(branchId, date, expectedCashMinor, () => onOpenChange(false));
  const difference = close.differenceMinor;
  const differenceTone = difference === null || difference === 0 ? "text-fg" : difference > 0 ? "text-success" : "text-error";

  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title={`Close ${formatDate(date)}`}
      description="Count the cash in the drawer. After closing, cash payments can no longer be back-dated to this day."
      submitLabel="Close day"
      submitting={close.submitting}
      onSubmit={close.submit}
      form={close.form}
      error={close.formError}
    >
      <MoneyField name="cashCounted" label="Cash counted" required />
      <DetailList
        items={[
          { label: "Expected cash", value: <MoneyText amountMinor={expectedCashMinor} /> },
          {
            label: "Difference",
            value: <MoneyText amountMinor={difference} className={`font-medium ${differenceTone}`} />,
          },
        ]}
      />
      <TextareaField name="note" label="Note" hint="Explain any shortage or excess." />
    </FormDialog>
  );
}
